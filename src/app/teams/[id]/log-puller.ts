import {WarcraftLogsClient} from "@/warcraft-logs/client";
import {GetReportQuery, Report, ReportFight} from "@/__generated__/graphql";
import {PlayerStats, Stats} from "@/warcraft-logs/model/player-stats";
import {DpsLossDebuffs, FloorFireAbilities, PolyMorphBomb, PowerInfusion, TrackedDebuffs, ZskarnBomb} from "@/app/_config/auras";

const DRAGON_FLIGHT_SEASON_4_START = 1713855600000;

export type ReportFilter =  (r: Report) => boolean;

export interface PlayerAccumulator {
    [key: number | string ]: any;
}

export interface FightSegmentation {
    bossFightIds: number[];
    trashFightIds: number[];
}

export async function fetchTeamStats({guildId, reportFilter, attendancePercent }: { guildId: number, reportFilter?: ReportFilter, attendancePercent?: number}) {
    const warcraftLogs = new WarcraftLogsClient();

    // Pulling all logs for the given guild from the current season, optionally filter reports
    const reports = await warcraftLogs.getReportsForGuild({guildId, seasonStartTime: DRAGON_FLIGHT_SEASON_4_START});
    const filteredReports = reportFilter ? reports.filter(reportFilter) : reports;
    console.log(`Retained a total of ${filteredReports.length} logs after applying filter`);

    // Once reports are available, we need to split the fights within the report
    // into boss fights and trash fights to segregate stats by fight type
    const reportsSplitByFightType = splitReportFights(filteredReports);
    const playerStats = new Map<number | string, PlayerStats>();

    for (const reportCode in reportsSplitByFightType) {
        const reportData = await warcraftLogs.getReport({
            reportCode,
            trashFightIds: reportsSplitByFightType[reportCode].trashFightIds,
            bossFightIds: reportsSplitByFightType[reportCode].bossFightIds,
            buffFilter: `type = "applybuff" AND ability.id IN (${PowerInfusion})`,
            debuffFilter: `type = "applydebuff" AND ability.id IN (${TrackedDebuffs.join(", ")})`,
            fireFilter: `ability.id IN (${FloorFireAbilities.join(", ")})`,
        });

        const reportStats = extractPlayerStatsFromLog(reportData);

        reportStats.forEach((stats, playerId) => {
            if (playerStats.has(playerId)) {
                playerStats.get(playerId)?.merge(stats);
            } else {
                playerStats.set(playerId, stats);
            }
        });
    }

    const allStats = Array.from(playerStats.values());

    return attendancePercent
        ? allStats.filter(p => p.appearances() / filteredReports.length >= attendancePercent)
        : allStats;
}

function splitReportFights(reports: Report[]): { [reportCode: string]: FightSegmentation; } {
    const reportEntries = reports.map(r => {
        // Fights has a Maybe<ReportType>[] value which we need to make sure that items are not null
        const fights: ReportFight[] = r?.fights?.filter(mrf => mrf != null) || [];
        const fightSegmentation: FightSegmentation = {bossFightIds: [], trashFightIds: []};
        for (const fight of fights) {
            isBossFight(fight)
                ? fightSegmentation.bossFightIds.push(fight.id)
                : fightSegmentation.trashFightIds.push(fight.id);
        }

        return [r.code, fightSegmentation];
    });

    return Object.fromEntries(reportEntries);
}

function isBossFight(fight: ReportFight) {
    return fight.difficulty === null && fight.kill === null;
}

function extractPlayerStatsFromLog(reportData: GetReportQuery) {
    const playerStats = new Map<number | string, PlayerStats>();

    const baseData = reportData.bossFights?.report?.baseData.data;
    const playerDetails: PlayerAccumulator = (Object.values(baseData.playerDetails) as any[])
        .flat()
        .reduce((map: PlayerAccumulator, player: any) => (map[player.guid] = player, map), {});
    const playerDetailsOnTrash: PlayerAccumulator = (Object.values(reportData.trashFights?.report?.baseData.data.playerDetails) as any)
        .flat()
        .reduce((map: PlayerAccumulator, player: any) => (map[player.guid] = player, map), {});

    const teamComposition = baseData.composition.reduce((map: PlayerAccumulator, player: any) => (map[player.guid] = player, map), {});

    const bossStats = extractPlayerStatsFromFightReport(reportData.bossFights?.report);
    const trashStats = extractPlayerStatsFromFightReport(reportData.trashFights?.report);

    // Tracked players is based off of boss fights
    for (const playerId of Object.keys(playerDetails)) {
        const playerStat = new PlayerStats({
            id: Number(playerId),
            name: playerDetails[playerId].name,
            server: playerDetails[playerId].server,
            role: teamComposition[playerId].specs[0].role,
            spec: teamComposition[playerId].specs[0].spec,
            playerClass: playerDetails[playerId].type,
        });

        const bossStat: Stats = {
            damageDone: bossStats.damage[playerId] ?? 0,
            healingDone: bossStats.healing[playerId] ?? 0,
            appearances: 1,
            potionsUsed: playerDetails[playerId]?.potionUse ?? 0,
            healthStonesUsed: playerDetails[playerId]?.healthstoneUse ?? 0,
            dispels: bossStats.dispels[playerId] ?? 0,
            casts: bossStats.casts[playerId] ?? 0,
            interrupts: bossStats.interrupts[playerId] ?? 0,
            damageTaken: bossStats.damageTaken[playerId]?.taken ?? 0,
            damageAbsorbed: bossStats.damageTaken[playerId]?.reduced ?? 0,
            threat: bossStats.threat[playerId] ?? 0,
            deaths: bossStats.deaths[playerId] ?? 0,
            powerInfusions: bossStats.powerInfusions[playerId] ?? 0,
            mechanicsTaken: bossStats.mechanicsTaken[playerId] ?? 0,
            fireDamageTaken: bossStats.fireDamageTaken[playerId] ?? 0,
            friendlyFireDamageDone: bossStats.friendlyFireDone[playerId] ?? 0,
            friendlyFireDamageTaken: bossStats.friendlyFireTakenByName[playerStat.name] ?? 0,
            bombsDetonated: bossStats.bombsDetonated[playerId] ?? 0,
            duckApplications: bossStats.duckApplications[playerId] ?? 0,
        };

        const trashStat: Stats = {
            damageDone: trashStats.damage[playerId] ?? 0,
            healingDone: trashStats.healing[playerId] ?? 0,
            appearances: 1,
            potionsUsed: playerDetailsOnTrash[playerId]?.potionUse ?? 0,
            healthStonesUsed: playerDetailsOnTrash[playerId]?.healthstoneUse ?? 0,
            dispels: trashStats.dispels[playerId] ?? 0,
            casts: trashStats.casts[playerId] ?? 0,
            interrupts: trashStats.interrupts[playerId] ?? 0,
            damageTaken: trashStats.damageTaken[playerId]?.taken ?? 0,
            damageAbsorbed: trashStats.damageTaken[playerId]?.reduced ?? 0,
            threat: trashStats.threat[playerId] ?? 0,
            deaths: trashStats.deaths[playerId] ?? 0,
            powerInfusions: 0,
            mechanicsTaken: 0,
            fireDamageTaken: 0,
            friendlyFireDamageDone: 0,
            friendlyFireDamageTaken: 0,
            bombsDetonated: 0,
            duckApplications: 0
        };

        playerStat.addStats('Boss', bossStat);
        playerStat.addStats('Trash', trashStat);
        playerStats.set(playerId, playerStat);
    }

    return playerStats;
}

function extractPlayerStatsFromFightReport(report: {
    __typename?: "Report";
    code: string;
    title: string;
    startTime: number;
    endTime: number;
    baseData?: any;
    preWipeDeaths?: any;
    casts?: any;
    dispels?: any;
    interupts?: any;
    threat?: any;
    damageTaken?: any;
    trackedBuffs?: any;
    trackedDebuffs?: any;
    fireDamage?: any;
    friendlyFire?: any;
} | null | undefined) {

    const baseData = report?.baseData.data;
    const damage = baseData.damageDone.reduce((map: PlayerAccumulator, player: any) => (map[player.guid] = player.total, map), {});
    const healing = baseData.healingDone.reduce((map: PlayerAccumulator, player: any) => (map[player.guid] = player.total, map), {});
    const casts = report?.casts.data.entries.reduce((map: PlayerAccumulator, player: any) => (map[player.guid] = player.total, map), {});
    const dispels = report?.dispels.data.entries
        .map((e: any) => e.entries)
        .flat()
        .map((e: any) => e.details)
        .flat()
        .reduce((map: PlayerAccumulator, player: any) => (map[player.guid] ? map[player.guid] += player.total : map[player.guid] = player.total, map), {});
    const interrupts = report?.interupts.data.entries
        .map((e: any)=> e.entries)
        .flat()
        .map((e: any) => e.details)
        .flat()
        .reduce((map: PlayerAccumulator, player: any) => (map[player.guid] ? map[player.guid] += player.total : map[player.guid] = player.total, map), {});
    const threat = report?.threat.data.threat.reduce((map: PlayerAccumulator, player: any) => (map[player.guid] = player.totalUptime, map), {});
    const damageTaken = report?.damageTaken.data.entries
        .reduce((map: PlayerAccumulator, player: any) => (map[player.guid] = {
            taken: player.total,
            reduced: player.totalReduced,
        }, map), {});

    const deaths = report?.preWipeDeaths
        ? report.preWipeDeaths.data.entries.reduce((map: PlayerAccumulator, player: any) => (map[player.guid] ? ++map[player.guid] : map[player.guid] = 1, map), {})
        : baseData.deathEvents.reduce((map: PlayerAccumulator, player: any) => (map[player.guid] ? ++map[player.guid] : map[player.guid] = 1, map), {});

    const powerInfusions = report?.trackedBuffs?.data
        .filter((b: any)=> b.abilityGameID === PowerInfusion)
        .map((b: any) => b.target.guid)
        .reduce((map: PlayerAccumulator, player: any)=> (map[player] ? ++map[player] : map[player] = 1, map), {});

    const bombsDetonated = report?.trackedDebuffs?.data
        .filter((b: any) => b.abilityGameID === ZskarnBomb)
        .map((b: any) => b.target.guid)
        .reduce((map: PlayerAccumulator, player: any) => (map[player] ? ++map[player] : map[player] = 1, map), {});

    const duckApplications = report?.trackedDebuffs?.data
        .filter((b: any) => b.abilityGameID === PolyMorphBomb)
        .map((b: any) => b.target.guid)
        .reduce((map: PlayerAccumulator, player: any) => (map[player] ? ++map[player] : map[player] = 1, map), {});

    const mechanicsTaken = report?.trackedDebuffs?.data
        .filter((d: any) => DpsLossDebuffs.indexOf(d.abilityGameID) >= 0)
        .map((b: any) => b.target.guid)
        .reduce((map: PlayerAccumulator, player: any) => (map[player] ? ++map[player] : map[player] = 1, map), {});

    const fireDamageTaken = report?.fireDamage?.data.entries
        .reduce((map: PlayerAccumulator, player: any) => (map[player.guid] = player.total, map), {});

    const friendlyFireDone = report?.friendlyFire?.data.entries
        .reduce((map: PlayerAccumulator, player: any) => (map[player.guid] = player.total, map), {});

    const friendlyFireTakenByName = report?.friendlyFire?.data.entries
        .map((ff: any) => ff.targets)
        .flat()
        .reduce((map: PlayerAccumulator, player: any) => (map[player.name] ? map[player.name] += player.total : map[player.name] = player.total, map), {});

    return {
        damage,
        healing,
        casts,
        dispels,
        interrupts,
        threat,
        damageTaken,
        deaths,
        powerInfusions,
        mechanicsTaken,
        fireDamageTaken,
        bombsDetonated,
        duckApplications,
        friendlyFireDone,
        friendlyFireTakenByName,
    };

}

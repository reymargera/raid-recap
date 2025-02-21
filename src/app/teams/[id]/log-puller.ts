import {WarcraftLogsClient} from "@/warcraft-logs/client";
import {GetReportQuery, Report, ReportFight} from "@/__generated__/graphql";
import {PlayerStats, Stats} from "@/warcraft-logs/model/player-stats";
import {ChunkyViscera, Devour, DpsLossDebuffs, Impaled, Infest, PowerInfusion, TrackedDebuffs, WebbingDebuffs } from "@/app/_config/auras";
import { NerubarPalaceEncounters } from "@/app/_config/encounters";
import { TeamConfig } from "@/app/_config/teams";

const SEASON_START_TIME = new Date("2024-09-10T22:00:00Z").getTime();

export type ReportFilter =  (r: Report) => boolean;

export interface PlayerAccumulator {
    [key: number | string ]: any;
}

export interface FightSegmentation {
    bossFightIds: number[];
    trashFightIds: number[];
}

export async function fetchTeamStats({
    guildId,
    reportFilter,
    attendancePercent,
    alts,
    attendanceExcludeOverride,
    attendanceIncludeOverride }: TeamConfig
) {
    const warcraftLogs = new WarcraftLogsClient();

    // Pulling all logs for the given guild from the current season, optionally filter reports
    const reports = await warcraftLogs.getReportsForGuild({guildId, seasonStartTime: SEASON_START_TIME});
    const filteredReports = reportFilter ? reports.filter(reportFilter) : reports;
    console.log(`Retained a total of ${filteredReports.length} logs after applying filter`);

    // Once reports are available, we need to split the fights within the report
    // into boss fights and trash fights to segregate stats by fight type
    const reportsSplitByFightType = splitReportFights(filteredReports);
    const playerStats = new Map<number | string, PlayerStats>();

    for (const reportCode of Object.keys(reportsSplitByFightType)) {
        const bossFights = reportsSplitByFightType[reportCode].bossFightIds;

        if (bossFights == null || bossFights.length === 0) {
            console.log(`Skipping report ${reportCode} as it has no boss fights`);
            continue;
        }

        const reportData = await warcraftLogs.getReport({
            reportCode,
            bossFightIds: reportsSplitByFightType[reportCode].bossFightIds,
            buffFilter: `type = "applybuff" AND ability.id IN (${PowerInfusion})`,
            debuffFilter: `type = "applydebuff" AND ability.id IN (${TrackedDebuffs.join(", ")})`,
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
    const altMergedStats = mergeAlts(allStats, alts);
    const explicitlyIncludedStats = altMergedStats.filter(p => !attendanceExcludeOverride?.includes(p.id));

    return attendancePercent
        ? explicitlyIncludedStats.filter(p => {
            if (attendanceIncludeOverride?.includes(p.id)) {
                return true;
            }

            return p.appearances() / filteredReports.length >= attendancePercent;
        })
        : explicitlyIncludedStats;
}

function splitReportFights(reports: Report[]): { [reportCode: string]: FightSegmentation; } {
    const seasonalEncounters = NerubarPalaceEncounters.map(e => e.id);

    const reportEntries = reports.map(r => {
        // Fights has a Maybe<ReportType>[] value which we need to make sure that items are not null
        const fights: ReportFight[] = r?.fights
            ?.filter(mrf => mrf != null) || [];

        const fightSegmentation: FightSegmentation = {bossFightIds: [], trashFightIds: []};
        for (const fight of fights) {
            isBossFight(seasonalEncounters, fight)
                ? fightSegmentation.bossFightIds.push(fight.id)
                : fightSegmentation.trashFightIds.push(fight.id);
        }

        return [r.code, fightSegmentation];
    });

    return Object.fromEntries(reportEntries);
}

function isBossFight(seasonalEncounters: number[], fight: ReportFight) {
    return seasonalEncounters.includes(fight.encounterID);
}

function extractPlayerStatsFromLog(reportData: GetReportQuery) {
    const playerStats = new Map<number | string, PlayerStats>();

    const baseData = reportData.bossFights?.report?.baseData.data;
    const playerDetails: PlayerAccumulator = (Object.values(baseData.playerDetails) as any[])
        .flat()
        .reduce((map: PlayerAccumulator, player: any) => (map[player.guid] = player, map), {});

    const teamComposition = baseData.composition.reduce((map: PlayerAccumulator, player: any) => (map[player.guid] = player, map), {});

    const bossStats = extractPlayerStatsFromFightReport(reportData.bossFights?.report);

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
            deaths: bossStats.deaths[playerId] ?? 0,
            powerInfusions: bossStats.powerInfusions[playerId] ?? 0,
            mechanicsTaken: bossStats.mechanicsTaken[playerId] ?? 0,
            friendlyFireDamageDone: bossStats.friendlyFireDone[playerId] ?? 0,
            friendlyFireDamageTaken: bossStats.friendlyFireTakenByName[playerStat.name] ?? 0,
            visceraFed: bossStats.visceraFed[playerId] ?? 0,
            timesEaten: bossStats.timesEaten[playerId] ?? 0,
            infests: bossStats.infests[playerId] ?? 0,
            impales: bossStats.imaples[playerId] ?? 0,
            webbed: bossStats.webbed[playerId] ?? 0,
            doublePhaseBlades: bossStats.doublePhaseBlades[playerId] ?? 0,
            chargeWebs: bossStats.chargeWebs[playerId] ?? 0,
        };


        playerStat.addStats('Boss', bossStat);
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
    damageTaken?: any;
    trackedBuffs?: any;
    trackedDebuffs?: any;
    friendlyFire?: any;
    chargeWebs?: any;
    phaseBlades?: any;
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

    const mechanicsTaken = report?.trackedDebuffs?.data
        .filter((d: any) => DpsLossDebuffs.indexOf(d.abilityGameID) >= 0)
        .map((b: any) => b.target.guid)
        .reduce((map: PlayerAccumulator, player: any) => (map[player] ? ++map[player] : map[player] = 1, map), {});

    const friendlyFireDone = report?.friendlyFire?.data.entries
        .reduce((map: PlayerAccumulator, player: any) => (map[player.guid] = player.total, map), {});

    const friendlyFireTakenByName = report?.friendlyFire?.data.entries
        .map((ff: any) => ff.targets)
        .flat()
        .reduce((map: PlayerAccumulator, player: any) => (map[player.name] ? map[player.name] += player.total : map[player.name] = player.total, map), {});

    const visceraFed = report?.trackedDebuffs?.data
        .filter((d: any) => d.abilityGameID === ChunkyViscera)
        .map((b: any) => b.target.guid)
        .reduce((map: PlayerAccumulator, player: any) => (map[player] ? ++map[player] : map[player] = 1, map), {});

    const timesEaten = report?.trackedDebuffs?.data
        .filter((d: any) => d.abilityGameID === Devour)
        .map((b: any) => b.target.guid)
        .reduce((map: PlayerAccumulator, player: any) => (map[player] ? ++map[player] : map[player] = 1, map), {});

    const infests = report?.trackedDebuffs?.data
        .filter((d: any) => d.abilityGameID === Infest)
        .map((b: any) => b.target.guid)
        .reduce((map: PlayerAccumulator, player: any) => (map[player] ? ++map[player] : map[player] = 1, map), {});

    const imaples = report?.trackedDebuffs?.data
        .filter((d: any) => d.abilityGameID === Impaled)
        .map((b: any) => b.target.guid)
        .reduce((map: PlayerAccumulator, player: any) => (map[player] ? ++map[player] : map[player] = 1, map), {});

    const webbed = report?.trackedDebuffs?.data
        .filter((d: any) => WebbingDebuffs.includes(d.abilityGameID))
        .map((b: any) => b.target.guid)
        .reduce((map: PlayerAccumulator, player: any) => (map[player] ? ++map[player] : map[player] = 1, map), {});

    const doublePhaseBlades = report?.phaseBlades?.data
        .filter((d: any) => d.stack > 1)
        .map((b: any) => b.target.guid)
        .reduce((map: PlayerAccumulator, player: any) => (map[player] ? ++map[player] : map[player] = 1, map), {});

    const chargeWebs = report?.chargeWebs?.data
        .map((b: any) => b.target.guid)
        .reduce((map: PlayerAccumulator, player: any) => (map[player] ? ++map[player] : map[player] = 1, map), {});

    return {
        damage,
        healing,
        casts,
        dispels,
        interrupts,
        damageTaken,
        deaths,
        powerInfusions,
        mechanicsTaken,
        friendlyFireDone,
        friendlyFireTakenByName,

        // Seasonal
        visceraFed,
        timesEaten,
        infests,
        imaples,
        webbed,
        doublePhaseBlades,
        chargeWebs,
    };

}

function mergeAlts(playerStats: PlayerStats[], alts?: { [key: string]: string[]; }) {

    if (!alts) {
        return playerStats;
    }

    Object.entries(alts).forEach(([mainName, altNames]) => {
        const mainStat = playerStats.find(ps => ps.name === mainName);

        if (mainStat) {
            altNames.forEach(altName => {
                const altStat = playerStats.find(ps => ps.name === altName);
                if (altStat) {
                    mainStat.merge(altStat);
                }
            });
        }
    });

    const allAlts = Object.values(alts).flat();

    return playerStats.filter(ps => !allAlts.includes(ps.name));
}

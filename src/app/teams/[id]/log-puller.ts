import {WarcraftLogsClient} from "@/warcraft-logs/client";
import {GetReportQuery, Report, ReportFight} from "@/__generated__/graphql";
import {PlayerStats, Stats} from "@/warcraft-logs/model/player-stats";

const DRAGON_FLIGHT_SEASON_4_START = 0;

export type ReportFilter =  (r: Report) => boolean;

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
    const playerStats = new Map<number, PlayerStats>();

    for (const reportCode in reportsSplitByFightType) {
        const reportData = await warcraftLogs.getReport({
            reportCode,
            trashFightIds: reportsSplitByFightType[reportCode].trashFightIds,
            bossFightIds: reportsSplitByFightType[reportCode].bossFightIds,
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
        const fights: ReportFight[] = r.fights ?? [];
        const fightSegmentation = {bossFightIds: [], trashFightIds: []};
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
    const playerStats = new Map<number, PlayerStats>();

    const baseData = reportData.bossFights?.report?.baseData.data;
    const playerDetails: { [key: number]: any; } = Object.values(baseData.playerDetails)
        .flat()
        .reduce((map, player) => (map[player.guid] = player, map), {});
    const teamComposition = baseData.composition.reduce((map, player) => (map[player.guid] = player, map), {});

    const bossStats = extractPlayerStatsFromFightReport(reportData.bossFights?.report);
    const trashStats = extractPlayerStatsFromFightReport(reportData.trashFights?.report);

    // Tracked players is based off of boss fights
    for (const playerId of Object.keys(playerDetails)) {
        const playerStat = new PlayerStats({
            id: playerId,
            name: playerDetails[playerId].name,
            server: playerDetails[playerId].server,
            role: teamComposition[playerId].specs[0].role,
            spec: teamComposition[playerId].specs[0].spec,
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
        };

        const trashStat: Stats = {
            damageDone: trashStats.damage[playerId] ?? 0,
            healingDone: trashStats.healing[playerId] ?? 0,
            appearances: 1,
            potionsUsed: trashStats[playerId]?.potionUse ?? 0,
            healthStonesUsed: trashStats[playerId]?.healthstoneUse ?? 0,
            dispels: trashStats.dispels[playerId] ?? 0,
            casts: trashStats.casts[playerId] ?? 0,
            interrupts: trashStats.interrupts[playerId] ?? 0,
            damageTaken: trashStats.damageTaken[playerId]?.taken ?? 0,
            damageAbsorbed: trashStats.damageTaken[playerId]?.reduced ?? 0,
            threat: trashStats.threat[playerId] ?? 0,
            deaths: trashStats.deaths[playerId] ?? 0,
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
    damageTaken?: any
} | null | undefined) {

    const baseData = report?.baseData.data;
    const damage = baseData.damageDone.reduce((map, player) => (map[player.guid] = player.total, map), {});
    const healing = baseData.healingDone.reduce((map, player) => (map[player.guid] = player.total, map), {});
    const casts = report?.casts.data.entries.reduce((map, player) => (map[player.guid] = player.total, map), {});
    const dispels = report?.dispels.data.entries
        .map(e => e.entries)
        .flat()
        .map(e => e.details)
        .flat()
        .reduce((map, player) => (map[player.guid] ? map[player.guid] += player.total : map[player.guid] = player.total, map), {});
    const interrupts = report?.interupts.data.entries
        .map(e => e.entries)
        .flat()
        .map(e => e.details)
        .flat()
        .reduce((map, player) => (map[player.guid] ? map[player.guid] += player.total : map[player.guid] = player.total, map), {});
    const threat = report?.threat.data.threat.reduce((map, player) => (map[player.guid] = player.totalUptime, map), {});
    const damageTaken = report?.damageTaken.data.entries
        .reduce((map, player) => (map[player.guid] = {
            taken: player.total,
            reduced: player.totalReduced,
        }, map), {});

    const deaths = report?.preWipeDeaths
        ? report.preWipeDeaths.data.entries.reduce((map, player) => (map[player.guid] ? ++map[player.guid] : map[player.guid] = 1, map), {})
        : baseData.deathEvents.reduce((map, player) => (map[player.guid] ? ++map[player.guid] : map[player.guid] = 1, map), {});

    return {damage, healing, casts, dispels, interrupts, threat, damageTaken, deaths};
}

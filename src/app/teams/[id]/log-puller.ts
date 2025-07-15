import {WarcraftLogsClient} from "@/warcraft-logs/client";
import {GetReportQuery, Report, ReportFight} from "@/__generated__/graphql";
import {PlayerStats, Stats} from "@/warcraft-logs/model/player-stats";
import {DpsLossDebuffs, PowerInfusion, TrackedDebuffs } from "@/app/_config/auras";
import { LiberationHoldEncounters, NerubarPalaceEncounters } from "@/app/_config/encounters";
import { TeamConfig } from "@/app/_config/teams";
import { TeamStats } from "@/warcraft-logs/model/team-stats";

const SEASON_START_TIME = new Date("2025-03-04T22:00:00Z").getTime();

export type ReportFilter =  (r: Report) => boolean;

export interface PlayerAccumulator {
    [key: number | string ]: any;
}

export interface FightSegmentation {
    bossFightIds: number[];
    trashFightIds: number[];
}

export type MaybeReportType = NonNullable<NonNullable<GetReportQuery['bossFights']>['report']> | null | undefined

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
    const teamStats = new TeamStats();
    teamStats.addRaidNights(filteredReports);

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
            trashFightIds: reportsSplitByFightType[reportCode].trashFightIds,
            buffFilter: `type = "applybuff" AND ability.id IN (${PowerInfusion})`,
            debuffFilter: `type = "applydebuff" AND ability.id IN (${TrackedDebuffs.join(", ")})`,
        });

        teamStats.addReport(reportData);
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

    const finalPlayerStats = attendancePercent
        ? explicitlyIncludedStats.filter(p => {
            if (attendanceIncludeOverride?.includes(p.id)) {
                return true;
            }

            return p.appearances() / filteredReports.length >= attendancePercent;
        })
        : explicitlyIncludedStats;

    return {
        playerStats: finalPlayerStats,
        teamStats: teamStats
    };
}

function splitReportFights(reports: Report[]): { [reportCode: string]: FightSegmentation; } {
    const seasonalEncounters = LiberationHoldEncounters.map(e => e.id);

    const reportEntries = reports.map(r => {
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
            friendlyFireDamageDone: bossStats.friendlyFireDoneByName[playerStat.name] ?? 0,
            friendlyFireDamageTaken: bossStats.friendlyFireTaken[playerId] ?? 0,

            // TODO: Fix placehodlers
            seasonalStats: {
                timesStoodInTrash: bossStats.garbagePileApplications[playerId] ?? 0,
                timesRolledOver: bossStats.rolledOver[playerId] ?? 0,
                timesRollingOver: bossStats.rollingOver[playerId] ?? 0,
                timesScrewed: bossStats.screwed[playerId] ?? 0,
                footbombsDetonated: 0,
                highRollerUptime: bossStats.highRollerUptime[playerId] ?? 0,
                timesCrushed: bossStats.crushes[playerId] ?? 0,
                coinsPushed: bossStats.coinsPushed[playerId] ?? 0,
                bombsTossed: bossStats.bombsTossed[playerId] ?? 0,
                coilsDestroyed: bossStats.coilsDestroyed[playerId] ?? 0,
                timesFlattened: bossStats.timesFlattened[playerId] ?? 0,
                blazeOfGloryCasts: bossStats.blazeOfGloryCasts[playerId] ?? 0,
                staticDischargeApplications: bossStats.staticDischargeApplications[playerId] ?? 0,
                blastburnRoarcannonDeaths: bossStats.blastburnRoarcannonDeaths[playerId] ?? 0,
                unstableShrapnelApplications: bossStats.unstableShrapnelApplications[playerId] ?? 0,
            }
        };


        playerStat.addStats('Boss', bossStat);
        playerStats.set(playerId, playerStat);
    }

    return playerStats;
}

function extractPlayerStatsFromFightReport(report:  MaybeReportType) {

    const baseData = report?.baseData.data;
    const damage = sumByPlayer(baseData.damageDone);
    const healing = sumByPlayer(baseData.healingDone);
    const casts = sumByPlayer(getTableDataEntries(report?.casts));
    const dispels = sumByPlayer(getTableSubEntryDetails(report?.dispels));
    const interrupts = sumByPlayer(getTableSubEntryDetails(report?.interupts));

    const damageTaken = report?.damageTaken.data.entries
        .reduce((map: PlayerAccumulator, player: any) => (map[player.guid] = {
            taken: player.total,
            reduced: player.totalReduced,
        }, map), {});

    const deaths = report?.preWipeDeaths
        // We are counting occurances rather than summing a specific stat, so data selecting is hardcoded to 1
        ? sumByPlayer(getTableDataEntries(report.preWipeDeaths), (d: any) => 1)
        : sumByPlayer(baseData.deathEvents, (d: any) => 1);

    const powerInfusionEvents = (report?.trackedBuffs?.data ?? []).filter((b: any) => b.abilityGameID === PowerInfusion);
    const powerInfusions = sumByPlayer(powerInfusionEvents, (d: any) => 1, (p: any) => p.target.guid);

    const dpsLossMechanicEvents = (report?.trackedDebuffs?.data ?? []).filter((d: any) => DpsLossDebuffs.indexOf(d.abilityGameID) >= 0);
    const mechanicsTaken = sumByPlayer(dpsLossMechanicEvents, (d: any) => 1, (p: any) => p.target.guid);

    const friendlyFireDoneByName = sumByPlayer(
        getTableDataEntries(report?.friendlyFire).flatMap((ff: any) => ff.sources),
        (d: any) => d.total,
        (p: any) => p.name
    );
    const friendlyFireTaken = sumByPlayer(getTableDataEntries(report?.friendlyFire));

    // Seaonal Stats
    const garbagePileApplications = sumByPlayer(getTableDataAuras(report?.garbagePileApplications), (d: any) => d.totalUses);
    const rolledOver = sumByPlayer(report?.rolledApplications?.data, (d: any) => 1, (p: any) => p.target.guid);
    const rollingOver = sumByPlayer(report?.rolledApplications?.data, (d: any) => 1, (p: any) => p.source.guid);
    const screwed = sumByPlayer(getTableDataAuras(report?.screwedApplications), (d: any) => d.totalUses);
    const highRollerUptime = sumByPlayer(getTableDataAuras(report?.highRollerUptime), (d: any) => d.totalUptime);
    const crushes = sumByPlayer(getTableDataAuras(report?.crushedApplications), (d: any) => d.totalUses);
    const coinsPushed = sumByPlayer(getTableDataEntries(report?.paylineCasts));
    const bombsTossed = sumByPlayer(getTableDataEntries(report?.gigaBombTosses));
    const coilsDestroyed = sumByPlayer(getTableDataAuras(report?.coilsDestroyed), (d: any) => d.totalUses);
    const timesFlattened = sumByPlayer(getTableDataEntries(report?.redAsphaltDeaths), (d: any) => 1);
    const blazeOfGloryCasts = sumByPlayer(getTableDataEntries(report?.blazeOfGloryCasts));
    const staticDischargeApplications = sumByPlayer(getTableDataAuras(report?.staticDischargeApplications), (d: any) => d.totalUses);
    const blastburnRoarcannonDeaths = sumByPlayer(getTableDataEntries(report?.blastburnRoarcannonDeaths), (d: any) => 1);
    const unstableShrapnelApplications = sumByPlayer(getTableDataAuras(report?.unstableShrapnelApplications), (d: any) => d.totalUses);

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
        friendlyFireDoneByName,
        friendlyFireTaken,

        // Seasonal
        garbagePileApplications,
        rolledOver,
        rollingOver,
        screwed,
        highRollerUptime,
        crushes,
        coinsPushed,
        bombsTossed,
        coilsDestroyed,
        timesFlattened,
        blazeOfGloryCasts,
        staticDischargeApplications,
        blastburnRoarcannonDeaths,
        unstableShrapnelApplications,
    };
}

function getTableDataEntries(reportTable: any) {
    return reportTable?.data?.entries ?? [];
}

function getTableDataAuras(reportTable: any) {
    return reportTable?.data?.auras ?? [];
}

function getTableSubEntryDetails(reportTable: any) {
    return (reportTable?.data?.entries ?? [])
        .flatMap((e: any) => e.entries)
        .flatMap((e: any) => e.details);
}

function sumByPlayer(playerData: any[], dataSelector = (d: any) => d.total, playerSelector = (p: any) => p.guid) {
    return playerData.reduce((map: PlayerAccumulator, playerData: any) => {
        const playerIdentifier = playerSelector(playerData);

        if (playerIdentifier === null || playerIdentifier === undefined) {
            return map;
        }

        const currentPlayerValue = map[playerIdentifier] ?? 0;
        const incomingPlayerValue = dataSelector(playerData);
        map[playerIdentifier] = currentPlayerValue + incomingPlayerValue;

        return map;
    }, {});
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

import {WarcraftLogsClient} from "@/warcraft-logs/client";
import {GetReportQuery, Report, ReportFight} from "@/__generated__/graphql";
import {PlayerStats, Stats} from "@/warcraft-logs/model/player-stats";
import {DpsLossDebuffs, PowerInfusion, TrackedDebuffs } from "@/app/_config/auras";
import { ManaforgeOmegaEncounters, LiberationHoldEncounters, NerubarPalaceEncounters, VoidspireEncounters, DreamriftEncounters, MarchOnQuelDanasEncounters, SporefallEncounters } from "@/app/_config/encounters";
import { TeamConfig } from "@/app/_config/teams";
import { TeamStats } from "@/warcraft-logs/model/team-stats";
import { DuplicateDetector } from "@/warcraft-logs/duplicate-detector";

const SEASON_START_TIME = new Date("2026-03-17T05:00:00Z").getTime();

// Midnight Season 1 tier has 4 concurrent raids
const CurrentSeasonEncounters = [
    ...VoidspireEncounters,
    ...DreamriftEncounters,
    ...MarchOnQuelDanasEncounters,
    ...SporefallEncounters,
];

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

    // Detect and remove duplicate reports to prevent double-counting stats
    const duplicateDetector = new DuplicateDetector();
    const deduplicatedReports = duplicateDetector.detectDuplicates(filteredReports);

    const teamStats = new TeamStats();
    teamStats.addRaidNights(deduplicatedReports);

    console.log(`Retained a total of ${deduplicatedReports.length} logs after applying filter and duplicate detection (${filteredReports.length - deduplicatedReports.length} duplicates removed)`);

    // Once reports are available, we need to split the fights within the report
    // into boss fights and trash fights to segregate stats by fight type
    const reportsSplitByFightType = splitReportFights(deduplicatedReports);
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

            return p.appearances() / deduplicatedReports.length >= attendancePercent;
        })
        : explicitlyIncludedStats;

    return {
        playerStats: finalPlayerStats,
        teamStats: teamStats
    };
}

function splitReportFights(reports: Report[]): { [reportCode: string]: FightSegmentation; } {
    const seasonalEncounters = CurrentSeasonEncounters.map(e => e.id);

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

/**
 * Split fights for a single report (exported for Server Actions)
 */
export function splitFightsForReport(fights: ReportFight[]): FightSegmentation {
    const seasonalEncounters = CurrentSeasonEncounters.map(e => e.id);
    const fightSegmentation: FightSegmentation = {bossFightIds: [], trashFightIds: []};

    for (const fight of fights) {
        isBossFight(seasonalEncounters, fight)
            ? fightSegmentation.bossFightIds.push(fight.id)
            : fightSegmentation.trashFightIds.push(fight.id);
    }

    return fightSegmentation;
}

function isBossFight(seasonalEncounters: number[], fight: ReportFight) {
    return seasonalEncounters.includes(fight.encounterID);
}

export function extractPlayerStatsFromLog(reportData: GetReportQuery) {
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

            seasonalStats: {
                beamDeaths: bossStats.beamDeaths[playerId] ?? 0,
                fearApplications: bossStats.fearApplications[playerId] ?? 0,
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

    // @ts-ignore: DPS Loss Debuffs TBD
    const dpsLossMechanicEvents = (report?.trackedDebuffs?.data ?? []).filter((d: any) => DpsLossDebuffs.indexOf(d.abilityGameID) >= 0);
    const mechanicsTaken = sumByPlayer(dpsLossMechanicEvents, (d: any) => 1, (p: any) => p.target.guid);

    const friendlyFireDoneByName = sumByPlayer(
        getTableDataEntries(report?.friendlyFire).flatMap((ff: any) => ff.sources),
        (d: any) => d.total,
        (p: any) => p.name
    );
    const friendlyFireTaken = sumByPlayer(getTableDataEntries(report?.friendlyFire));

    // Seasonal Stats - Midnight Season 1
    const beamDeaths = sumByPlayer(getTableDataEntries(report?.beamDeaths), (d: any) => 1);
    const fearApplications = sumByPlayer(getTableDataAuras(report?.fearApplications), (d: any) => d.totalUses);

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

        // Seasonal Stats - Midnight Season 1
        beamDeaths,
        fearApplications,
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

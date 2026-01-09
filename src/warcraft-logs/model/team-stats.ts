import { GetReportQuery, Report } from "@/__generated__/graphql";
import { ManaforgeOmegaEncounters } from "@/app/_config/encounters";
import crypto from "crypto";

interface DamageTakenAbility {
    name: string;
    guid: number;
    total: number;
}

interface DeathAbility {
    name: string;
    guid: number;
    count: number;
}

interface FightOverview {
    name: string;
    difficulty: string;
    duration: number;
    kill: boolean;
    fightPercentage: number;
}

// Difficulty levels (skip LFR=1)
export const DifficultyLevel = {
    Normal: 3,
    Heroic: 4,
    Mythic: 5,
} as const;

export type DifficultyValue = typeof DifficultyLevel[keyof typeof DifficultyLevel];

// Per-difficulty stats for a boss
export interface BossDifficultyStats {
    kills: number;
    wipes: number;
    firstKillTimestamp: number | null;  // UNIX timestamp (report.startTime + fight.endTime)
    bestKillDuration: number | null;    // milliseconds
    totalPullTime: number;              // milliseconds
    bestWipePercentage: number | null;  // lowest boss % reached on a wipe (lower is better)
}

// Per-boss stats across all difficulties
export interface BossStats {
    encounterId: number;
    name: string;
    difficulties: Map<DifficultyValue, BossDifficultyStats>;
}

export class TeamStats {
    // Raid night specific stats
    public totalRaidNights: number = 0;
    public timeSpentPullingBosses: number = 0; // in milliseconds
    public totalTime: number = 0; // in milliseconds
    public longestBossFightKill: FightOverview = { name: 'Placeholder', difficulty: 'Unknown', duration: 0, kill: true, fightPercentage: 0 };
    public shortestBossFightKill: FightOverview = { name: 'Placeholder', difficulty: 'Unknown', duration: Number.MAX_VALUE, kill: true, fightPercentage: 0 };
    public lowestWipePercentage: FightOverview = { name: 'Placeholder', difficulty: 'Unknown', duration: 0, kill: false, fightPercentage: 100 };
    public totalResets: number = 0;
    public totalPulls: number = 0;
    public totalFailedResets: number = 0;
    public totalBossKills: number = 0;

    // Boss progression tracking (per-boss, per-difficulty stats)
    public bossProgression: Map<number, BossStats> = new Map();

    // Report specific stats
    public uniqueCharacters: Set<string> = new Set();
    public uniqueSpecs: Set<string> = new Set();
    public topDamageTakenAbilities: Map<string, DamageTakenAbility> = new Map();
    public topDeathAbilities: Map<string, DeathAbility> = new Map();
    public uniqueTalentLoadouts: Set<string> = new Set();

    private allEncounters = [...ManaforgeOmegaEncounters];

    /**
     * Takes in top level report data to capture raid night specific data, such as total number of raid nights,
     * time spent pulling bosses, total time, longest boss fight kill, shortest boss fight kill, lowest wipe,
     * total number of assumed resets
     * @param reports List of reports that coorespond to raid nights a particular team has had
     */
    public addRaidNights(reports: Report[]) {
        this.totalRaidNights += reports.length;

        for (const report of reports) {
            if (report.fights) {
                let firstPull = Number.MAX_VALUE;
                let lastPull = 0;

                for (const fight of report.fights) {
                    if (!fight) continue;

                    const isReset = this.isReset(fight);
                    const isBossFight = this.isBossFight(fight);
                    const isFailedReset = this.isFailedReset(fight);

                    if (isReset) {
                        firstPull = Math.min(firstPull, fight.startTime);
                        lastPull = Math.max(lastPull, fight.endTime);
                        this.totalResets++;
                        continue;
                    }

                    if (isFailedReset) {
                        firstPull = Math.min(firstPull, fight.startTime);
                        lastPull = Math.max(lastPull, fight.endTime);
                        this.totalFailedResets++;
                        this.totalPulls++;
                        continue;
                    }

                    if (isBossFight) {
                        this.totalPulls++;
                        firstPull = Math.min(firstPull, fight.startTime);
                        lastPull = Math.max(lastPull, fight.endTime);
                        const fightDuration = fight.endTime - fight.startTime;
                        this.timeSpentPullingBosses += fightDuration;

                        // Track boss-specific progression stats
                        this.trackBossProgression(fight, report.startTime || 0);

                        // Track longest/shortest kills and total boss kills
                        if (fight.kill) {
                            this.totalBossKills++;
                            if (fightDuration > this.longestBossFightKill.duration) {
                                this.longestBossFightKill = this.captureFightOverview(fight);
                            }
                            if (fightDuration < this.shortestBossFightKill.duration) {
                                this.shortestBossFightKill = this.captureFightOverview(fight);
                            }
                        }

                        // Track lowest wipe percentage
                        if (!fight.kill && fight.fightPercentage && fight.fightPercentage < this.lowestWipePercentage.fightPercentage) {
                            this.lowestWipePercentage = this.captureFightOverview(fight);
                        }
                    }
                }

                this.totalTime += (lastPull - firstPull);
            }
        }
    }

    /**
     * Takes in a low level report to extract stats such as unique number of charcters, unique specs,
     * top 5 damage taken abilities, top 5 death abilities, unique number of talent load outs
     * @param report Lower level report data that cooresponds to a raid night
     */
    public addReport(report: GetReportQuery) {
        const baseData = report.bossFights?.report?.baseData?.data;
        if (!baseData) return;

        // Track unique characters
        if (baseData.composition) {
            for (const player of baseData.composition) {
                if (player?.name) {
                    this.uniqueCharacters.add(player.name);
                }
            }
        }

        // Track unique specs from player details
        const playerDetails = baseData.playerDetails;
        if (playerDetails) {
            const roles = ['tanks', 'healers', 'dps'];
            for (const role of roles) {
                const players = playerDetails[role];
                if (Array.isArray(players)) {
                    for (const player of players) {
                        if (player?.type && player?.specs) {
                            for (const spec of player.specs) {
                                const specString = `${player.type}-${spec}`;
                                this.uniqueSpecs.add(specString);
                            }
                        }
                    }
                }
            }
        }

        // Track damage taken abilities
        if (baseData.damageTaken) {
            for (const damage of baseData.damageTaken) {
                if (damage?.name && damage?.guid && damage?.total) {
                    const key = `${damage.name}-${damage.guid}`;
                    const existing = this.topDamageTakenAbilities.get(key);
                    if (existing) {
                        existing.total += damage.total;
                    } else {
                        this.topDamageTakenAbilities.set(key, {
                            name: damage.name,
                            guid: damage.guid,
                            total: damage.total
                        });
                    }
                }
            }
        }

        // Track death abilities
        if (baseData.deathEvents) {
            for (const death of baseData.deathEvents) {
                if (death?.ability?.name && death?.ability?.guid) {
                    const key = `${death.ability.name}-${death.ability.guid}`;
                    const existing = this.topDeathAbilities.get(key);
                    if (existing) {
                        existing.count++;
                    } else {
                        this.topDeathAbilities.set(key, {
                            name: death.ability.name,
                            guid: death.ability.guid,
                            count: 1
                        });
                    }
                }
            }
        }

        // Track unique talent loadouts
        if (playerDetails) {
            const roles = ['tanks', 'healers', 'dps'];
            for (const role of roles) {
                const players = playerDetails[role];
                if (Array.isArray(players)) {
                    for (const player of players) {
                        if (player?.combatantInfo?.talentTree) {
                            const talentHash = this.hashTalentTree(player.combatantInfo.talentTree);
                            this.uniqueTalentLoadouts.add(talentHash);
                        }
                    }
                }
            }
        }
    }

    private isBossFight(fight: any): boolean {
        // Check if encounterID matches any known encounter
        if (fight.encounterID) {
            return this.allEncounters.some(encounter => encounter.id === fight.encounterID);
        }

        // Check if fight name matches any encounter name (for resets)
        if (fight.name) {
            return this.allEncounters.some(encounter => encounter.name === fight.name);
        }

        return false;
    }

    private isReset(fight: any): boolean {
        // Resets have boss names but very short durations
        const fightDuration = fight.endTime - fight.startTime;
        const isBossName = this.allEncounters.some(encounter => encounter.name === fight.name);
        return isBossName && fightDuration < 3000; // Less than 3 seconds
    }

    private isFailedReset(fight: any): boolean {
        // Failed reset: boss fight that ends in wipe, under 1 minute, boss at 98%+
        const fightDuration = fight.endTime - fight.startTime;
        const isBossFight = this.isBossFight(fight);
        const isWipe = !fight.kill;
        const isUnderMinute = fightDuration < 60000; // Less than 1 minute
        const isBossHighHealth = fight.fightPercentage >= 98;

        return isBossFight && isWipe && isUnderMinute && isBossHighHealth;
    }

    /**
     * Track boss-specific progression stats per difficulty
     * @param fight The fight data from the report
     * @param reportStartTime UNIX timestamp of the report start (ms)
     */
    private trackBossProgression(fight: any, reportStartTime: number): void {
        const encounterId = fight.encounterID;
        const rawDifficulty = fight.difficulty as number;
        const fightDuration = fight.endTime - fight.startTime;

        // Skip if difficulty is not a tracked value (Normal=3, Heroic=4, Mythic=5)
        // This also skips LFR (1) and any unknown difficulty values
        if (rawDifficulty !== DifficultyLevel.Normal &&
            rawDifficulty !== DifficultyLevel.Heroic &&
            rawDifficulty !== DifficultyLevel.Mythic) {
            return;
        }

        const difficulty = rawDifficulty as DifficultyValue;

        // Initialize boss stats if not exists
        if (!this.bossProgression.has(encounterId)) {
            const encounter = this.allEncounters.find(e => e.id === encounterId);
            this.bossProgression.set(encounterId, {
                encounterId,
                name: encounter?.name || fight.name || 'Unknown',
                difficulties: new Map(),
            });
        }

        const bossStats = this.bossProgression.get(encounterId)!;

        // Initialize difficulty stats if not exists
        if (!bossStats.difficulties.has(difficulty)) {
            bossStats.difficulties.set(difficulty, {
                kills: 0,
                wipes: 0,
                firstKillTimestamp: null,
                bestKillDuration: null,
                totalPullTime: 0,
                bestWipePercentage: null,
            });
        }

        const diffStats = bossStats.difficulties.get(difficulty)!;
        diffStats.totalPullTime += fightDuration;

        if (fight.kill) {
            diffStats.kills++;

            // Calculate actual kill timestamp: report start + fight end (relative)
            const killTimestamp = reportStartTime + fight.endTime;

            // Track first kill timestamp (keep earliest)
            if (diffStats.firstKillTimestamp === null || killTimestamp < diffStats.firstKillTimestamp) {
                diffStats.firstKillTimestamp = killTimestamp;
            }

            // Track best kill duration (keep shortest)
            if (diffStats.bestKillDuration === null || fightDuration < diffStats.bestKillDuration) {
                diffStats.bestKillDuration = fightDuration;
            }
        } else {
            diffStats.wipes++;

            // Track best wipe percentage (lower is better - closer to killing the boss)
            if (fight.fightPercentage !== null && fight.fightPercentage !== undefined) {
                if (diffStats.bestWipePercentage === null || fight.fightPercentage < diffStats.bestWipePercentage) {
                    diffStats.bestWipePercentage = fight.fightPercentage;
                }
            }
        }
    }

    private hashTalentTree(talentTree: any[]): string {
        // Sort talents by nodeID to ensure consistent hashing
        const sortedTalents = talentTree
            .map(talent => `${talent.nodeID}:${talent.id}:${talent.rank}`)
            .sort()
            .join(',');

        return crypto.createHash('md5').update(sortedTalents).digest('hex');
    }

    private captureFightOverview(fight: any): FightOverview {
        let difficultyName;

        switch (fight.difficulty) {
            case 1:
                difficultyName = 'LFR';
                break;
            case 3:
                difficultyName = 'Normal';
                break;
            case 4:
                difficultyName = 'Heroic';
                break;
            case 5:
                difficultyName = 'Mythic';
                break;
            default: difficultyName = 'Unknown';

        }

        return {
            name: fight.name,
            difficulty: difficultyName,
            duration: fight.endTime - fight.startTime,
            kill: fight.kill,
            fightPercentage: fight.fightPercentage
        };
    }

    // Helper methods to get top results
    public getTopDamageTakenAbilities(limit: number = 5): DamageTakenAbility[] {
        return Array.from(this.topDamageTakenAbilities.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, limit);
    }

    public getTopDeathAbilities(limit: number = 5): DeathAbility[] {
        return Array.from(this.topDeathAbilities.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    public toJson() {
        return JSON.stringify(
            this,
            (k, v) => {
                if (v instanceof Set) {
                    return {
                        __type: 'Set',
                        value: [...v],
                    }
                } else if (v instanceof Map) {
                    return {
                        __type: 'Map',
                        value: Array.from(v.entries()),
                    }
                } else {
                   return v;
                }
            }
        );
    }

    public fromJson(json: string) {
        const parsedStats = JSON.parse(json,
            (k, v) => {
                if (typeof v === 'object' && v !== null && v.__type === 'Set') {
                    return new Set(v.value);
                }

                if (typeof v === 'object' && v !== null && v.__type === 'Map') {
                    return new Map(v.value);
                }

                return v;
            }
        );

        this.totalRaidNights = parsedStats.totalRaidNights || 0;
        this.timeSpentPullingBosses = parsedStats.timeSpentPullingBosses || 0;
        this.totalTime = parsedStats.totalTime || 0;
        this.longestBossFightKill = parsedStats.longestBossFightKill;
        this.shortestBossFightKill = parsedStats.shortestBossFightKill;
        this.lowestWipePercentage = parsedStats.lowestWipePercentage;
        this.totalResets = parsedStats.totalResets || 0;
        this.totalPulls = parsedStats.totalPulls || 0;
        this.totalFailedResets = parsedStats.totalFailedResets || 0;
        this.totalBossKills = parsedStats.totalBossKills || 0;
        this.bossProgression = parsedStats.bossProgression || new Map();
        this.uniqueCharacters = parsedStats.uniqueCharacters;
        this.uniqueSpecs = parsedStats.uniqueSpecs;
        this.topDamageTakenAbilities = parsedStats.topDamageTakenAbilities;
        this.topDeathAbilities = parsedStats.topDeathAbilities;
        this.uniqueTalentLoadouts = parsedStats.uniqueTalentLoadouts;

        return this;
    }

    public static fromJson(json: string): TeamStats {
        const instance = new TeamStats();
        return instance.fromJson(json);
    }

    /**
     * Merge another TeamStats instance into this one
     */
    public merge(other: TeamStats): void {
        // Merge numeric fields
        this.totalRaidNights += other.totalRaidNights;
        this.timeSpentPullingBosses += other.timeSpentPullingBosses;
        this.totalTime += other.totalTime;
        this.totalResets += other.totalResets;
        this.totalPulls += other.totalPulls;
        this.totalFailedResets += other.totalFailedResets;
        this.totalBossKills += other.totalBossKills;

        // Merge Sets
        for (const char of other.uniqueCharacters) {
            this.uniqueCharacters.add(char);
        }
        for (const spec of other.uniqueSpecs) {
            this.uniqueSpecs.add(spec);
        }
        for (const loadout of other.uniqueTalentLoadouts) {
            this.uniqueTalentLoadouts.add(loadout);
        }

        // Merge Maps (damage taken abilities)
        for (const [key, ability] of other.topDamageTakenAbilities) {
            const existing = this.topDamageTakenAbilities.get(key);
            if (existing) {
                existing.total += ability.total;
            } else {
                this.topDamageTakenAbilities.set(key, { ...ability });
            }
        }

        // Merge Maps (death abilities)
        for (const [key, death] of other.topDeathAbilities) {
            const existing = this.topDeathAbilities.get(key);
            if (existing) {
                existing.count += death.count;
            } else {
                this.topDeathAbilities.set(key, { ...death });
            }
        }

        // Compare and update FightOverview fields (keep best/worst)
        if (other.longestBossFightKill.duration > this.longestBossFightKill.duration) {
            this.longestBossFightKill = other.longestBossFightKill;
        }
        if (other.shortestBossFightKill.duration < this.shortestBossFightKill.duration) {
            this.shortestBossFightKill = other.shortestBossFightKill;
        }
        if (other.lowestWipePercentage.fightPercentage < this.lowestWipePercentage.fightPercentage) {
            this.lowestWipePercentage = other.lowestWipePercentage;
        }

        // Merge boss progression
        for (const [encounterId, otherBossStats] of other.bossProgression) {
            if (!this.bossProgression.has(encounterId)) {
                // Clone the boss stats from other
                this.bossProgression.set(encounterId, {
                    encounterId: otherBossStats.encounterId,
                    name: otherBossStats.name,
                    difficulties: new Map(),
                });
            }

            const thisBossStats = this.bossProgression.get(encounterId)!;

            for (const [difficulty, otherDiffStats] of otherBossStats.difficulties) {
                if (!thisBossStats.difficulties.has(difficulty)) {
                    thisBossStats.difficulties.set(difficulty, {
                        kills: 0,
                        wipes: 0,
                        firstKillTimestamp: null,
                        bestKillDuration: null,
                        totalPullTime: 0,
                        bestWipePercentage: null,
                    });
                }

                const thisDiffStats = thisBossStats.difficulties.get(difficulty)!;

                // Merge numeric fields
                thisDiffStats.kills += otherDiffStats.kills;
                thisDiffStats.wipes += otherDiffStats.wipes;
                thisDiffStats.totalPullTime += otherDiffStats.totalPullTime;

                // Keep earliest first kill timestamp
                if (otherDiffStats.firstKillTimestamp !== null) {
                    if (thisDiffStats.firstKillTimestamp === null ||
                        otherDiffStats.firstKillTimestamp < thisDiffStats.firstKillTimestamp) {
                        thisDiffStats.firstKillTimestamp = otherDiffStats.firstKillTimestamp;
                    }
                }

                // Keep best (shortest) kill duration
                if (otherDiffStats.bestKillDuration !== null) {
                    if (thisDiffStats.bestKillDuration === null ||
                        otherDiffStats.bestKillDuration < thisDiffStats.bestKillDuration) {
                        thisDiffStats.bestKillDuration = otherDiffStats.bestKillDuration;
                    }
                }

                // Keep best (lowest) wipe percentage
                if (otherDiffStats.bestWipePercentage !== null) {
                    if (thisDiffStats.bestWipePercentage === null ||
                        otherDiffStats.bestWipePercentage < thisDiffStats.bestWipePercentage) {
                        thisDiffStats.bestWipePercentage = otherDiffStats.bestWipePercentage;
                    }
                }
            }
        }
    }
}

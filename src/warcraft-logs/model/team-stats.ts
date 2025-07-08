import { GetReportQuery, Report } from "@/__generated__/graphql";
import { NerubarPalaceEncounters, LiberationHoldEncounters } from "@/app/_config/encounters";
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

interface PlayerSpec {
    class: string;
    spec: string;
    role: string;
}

interface FightOverview {
    name: string;
    difficulty: string;
    duration: number;
    kill: boolean;
    fightPercentage: number;
}

export class TeamStats {
    // Raid night specific stats
    public totalRaidNights: number = 0;
    public timeSpentPullingBosses: number = 0; // in milliseconds
    public totalTime: number = 0; // in milliseconds
    public longestBossFightKill: FightOverview = { name: 'Placeholder', difficulty: 0, duration: 0, kill: true, fightPercentage: 0 };
    public shortestBossFightKill: FightOverview = { name: 'Placeholder', difficulty: 0, duration: Number.MAX_VALUE, kill: true, fightPercentage: 0 };
    public lowestWipePercentage: FightOverview = { name: 'Placeholder', difficulty: 0, duration: 0, kill: false, fightPercentage: 100 };
    public totalResets: number = 0;

    // Report specific stats
    public uniqueCharacters: Set<string> = new Set();
    public uniqueSpecs: Set<string> = new Set();
    public topDamageTakenAbilities: Map<string, DamageTakenAbility> = new Map();
    public topDeathAbilities: Map<string, DeathAbility> = new Map();
    public uniqueTalentLoadouts: Set<string> = new Set();

    private allEncounters = [...LiberationHoldEncounters];

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

                    if (isReset) {
                        firstPull = Math.min(firstPull, fight.startTime);
                        lastPull = Math.max(lastPull, fight.endTime);
                        this.totalResets++;
                        continue;
                    }

                    if (isBossFight) {
                        firstPull = Math.min(firstPull, fight.startTime);
                        lastPull = Math.max(lastPull, fight.endTime);
                        const fightDuration = fight.endTime - fight.startTime;
                        this.timeSpentPullingBosses += fightDuration;

                        // Track longest/shortest kills
                        if (fight.kill) {
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
}

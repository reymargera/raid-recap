import { Report, ReportFight } from "@/__generated__/graphql";
import { LiberationHoldEncounters } from "@/app/_config/encounters";

interface BossFightSignature {
    encounterID: number;
    difficulty: number;
    kill: boolean;
    fightPercentage: number;
    duration: number;
    gapToPrevious: number; // time since previous boss fight
}

interface ReportFingerprint {
    reportCode: string;
    bossSequence: BossFightSignature[];
    totalBossDuration: number;
    raidTimespan: number; // first boss to last boss
}

interface DuplicateDetectionConfig {
    timingTolerancePercent: number; // ±% tolerance for fight durations and gaps
    percentageTolerancePercent: number; // ±% tolerance for wipe percentages
    enableLogging: boolean;
}

export class DuplicateDetector {
    private config: DuplicateDetectionConfig;
    private seasonalEncounterIds: Set<number>;

    constructor(config?: Partial<DuplicateDetectionConfig>) {
        this.config = {
            timingTolerancePercent: 1,
            percentageTolerancePercent: 0.1,
            enableLogging: true,
            ...config
        };

        this.seasonalEncounterIds = new Set(LiberationHoldEncounters.map(e => e.id));
    }

    /**
     * Detects and removes duplicate reports from a list, keeping the first occurrence of each unique raid
     */
    public detectDuplicates(reports: Report[]): Report[] {
        if (reports.length <= 1) {
            return reports;
        }

        const fingerprints = reports.map(report => this.generateFingerprint(report));
        const duplicateGroups = this.findDuplicateGroups(fingerprints);

        // Track which reports to keep (first in each duplicate group)
        const reportsToKeep = new Set<string>();
        let totalSkipped = 0;

        for (const group of duplicateGroups) {
            if (group.length > 1) {
                // Keep the first report in each group (earliest in original list)
                reportsToKeep.add(group[0].reportCode);
                totalSkipped += group.length - 1;

                if (this.config.enableLogging) {
                    const keptReport = group[0].reportCode;
                    const skippedReports = group.slice(1).map(f => f.reportCode);
                    console.log(`Duplicate detection: Keeping report ${keptReport}, skipping duplicates: ${skippedReports.join(', ')}`);
                }
            } else {
                // Single report, always keep
                reportsToKeep.add(group[0].reportCode);
            }
        }

        if (this.config.enableLogging && totalSkipped > 0) {
            console.log(`Duplicate detection: Skipped ${totalSkipped} duplicate reports out of ${reports.length} total`);
        }

        // Return reports in original order, filtered to only kept reports
        return reports.filter(report => reportsToKeep.has(report.code));
    }

    /**
     * Generates a fingerprint for a report based on boss fight sequence and timings
     */
    private generateFingerprint(report: Report): ReportFingerprint {
        const bossFights = this.extractBossFights(report);
        const bossSequence = this.createBossFightSequence(bossFights);

        const totalBossDuration = bossSequence.reduce((sum, fight) => sum + fight.duration, 0);
        const raidTimespan = bossFights.length > 0
            ? bossFights[bossFights.length - 1].endTime - bossFights[0].startTime
            : 0;

        return {
            reportCode: report.code,
            bossSequence,
            totalBossDuration,
            raidTimespan
        };
    }

    /**
     * Extracts only boss fights from a report (filters out trash)
     */
    private extractBossFights(report: Report): ReportFight[] {
        if (!report.fights) {
            return [];
        }

        return report.fights
            .filter((fight): fight is ReportFight =>
                fight !== null && this.seasonalEncounterIds.has(fight.encounterID)
            )
            .sort((a, b) => a.startTime - b.startTime);
    }

    /**
     * Creates an ordered sequence of boss fight signatures with relative timings
     */
    private createBossFightSequence(bossFights: ReportFight[]): BossFightSignature[] {
        return bossFights.map((fight, index) => {
            const duration = fight.endTime - fight.startTime;
            const gapToPrevious = index > 0
                ? fight.startTime - bossFights[index - 1].endTime
                : 0;

            return {
                encounterID: fight.encounterID,
                difficulty: fight.difficulty || 0,
                kill: fight.kill || false,
                fightPercentage: fight.fightPercentage || 100,
                duration,
                gapToPrevious
            };
        });
    }

    /**
     * Groups fingerprints by similarity, returning arrays of potential duplicates
     */
    private findDuplicateGroups(fingerprints: ReportFingerprint[]): ReportFingerprint[][] {
        const groups: ReportFingerprint[][] = [];
        const processed = new Set<string>();

        for (const fingerprint of fingerprints) {
            if (processed.has(fingerprint.reportCode)) {
                continue;
            }

            const group = [fingerprint];
            processed.add(fingerprint.reportCode);

            // Find all other fingerprints that match this one
            for (const otherFingerprint of fingerprints) {
                if (processed.has(otherFingerprint.reportCode)) {
                    continue;
                }

                if (this.fingerprintsMatch(fingerprint, otherFingerprint)) {
                    group.push(otherFingerprint);
                    processed.add(otherFingerprint.reportCode);
                }
            }

            groups.push(group);
        }

        return groups;
    }

    /**
     * Determines if two fingerprints represent the same raid with configurable tolerance
     */
    private fingerprintsMatch(fp1: ReportFingerprint, fp2: ReportFingerprint): boolean {
        // Empty reports should never be considered duplicates
        if (fp1.bossSequence.length === 0 || fp2.bossSequence.length === 0) {
            return false;
        }

        // Must have same number of boss fights
        if (fp1.bossSequence.length !== fp2.bossSequence.length) {
            return false;
        }

        // Must have same sequence of encounters and difficulties
        for (let i = 0; i < fp1.bossSequence.length; i++) {
            const fight1 = fp1.bossSequence[i];
            const fight2 = fp2.bossSequence[i];

            if (fight1.encounterID !== fight2.encounterID ||
                fight1.difficulty !== fight2.difficulty) {
                return false;
            }

            // Kill status must match exactly
            if (fight1.kill !== fight2.kill) {
                return false;
            }

            // For wipes, fight percentages must be within tolerance
            if (!fight1.kill && !fight2.kill) {
                const percentageDiff = Math.floor(Math.abs(fight1.fightPercentage - fight2.fightPercentage));
                if (percentageDiff > this.config.percentageTolerancePercent) {
                    return false;
                }
            }

            // Fight durations must be within tolerance
            if (!this.timingsWithinTolerance(fight1.duration, fight2.duration)) {
                return false;
            }

            // Gaps between fights must be within tolerance (skip first fight which has 0 gap)
            if (i > 0 && !this.timingsWithinTolerance(fight1.gapToPrevious, fight2.gapToPrevious)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Checks if two timing values are within the configured tolerance percentage
     */
    private timingsWithinTolerance(time1: number, time2: number): boolean {
        if (time1 === 0 && time2 === 0) {
            return true;
        }

        const maxTime = Math.max(time1, time2);
        const timeDiff = Math.abs(time1 - time2);
        const toleranceThreshold = maxTime * (this.config.timingTolerancePercent / 100);

        return timeDiff <= toleranceThreshold;
    }
}

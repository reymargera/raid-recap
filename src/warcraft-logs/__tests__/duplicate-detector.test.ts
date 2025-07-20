import { DuplicateDetector } from '../duplicate-detector';
import { Report } from '@/__generated__/graphql';

// Mock data for testing
const createMockReport = (
    code: string,
    fights: Array<{
        id: number;
        encounterID: number;
        difficulty: number;
        kill: boolean;
        fightPercentage: number;
        startTime: number;
        endTime: number;
        name: string;
    }>
): Report => ({
    code,
    title: `Mock Report ${code}`,
    endTime: Math.max(...fights.map(f => f.endTime)),
    exportedSegments: 1,
    fights: fights.map(f => ({
        __typename: 'ReportFight' as const,
        ...f
    })),
    guild: null,
    guildTag: null,
    masterData: null,
    owner: { id: 1, name: 'TestUser' },
    playerDetails: null,
    rankings: null,
    revision: 1,
    segments: 1,
    startTime: Math.min(...fights.map(f => f.startTime)),
    table: null,
    visibility: 'public',
    zone: null
});

describe('DuplicateDetector', () => {
    let detector: DuplicateDetector;

    beforeEach(() => {
        detector = new DuplicateDetector({ enableLogging: false });
    });

    describe('identical fight sequences', () => {
        it('should detect identical reports as duplicates', () => {
            const fights = [
                { id: 1, encounterID: 3009, difficulty: 4, kill: false, fightPercentage: 45.2, startTime: 0, endTime: 120000, name: 'Vexie and the Geargrinders' },
                { id: 2, encounterID: 3009, difficulty: 4, kill: true, fightPercentage: 0, startTime: 150000, endTime: 285000, name: 'Vexie and the Geargrinders' },
                { id: 3, encounterID: 3010, difficulty: 4, kill: false, fightPercentage: 12.8, startTime: 330000, endTime: 425000, name: 'Cauldron of Carnage' }
            ];

            const report1 = createMockReport('ABC123', fights);
            const report2 = createMockReport('DEF456', fights); // Identical fights

            const result = detector.detectDuplicates([report1, report2]);

            expect(result).toHaveLength(1);
            expect(result[0].code).toBe('ABC123'); // Should keep the first one
        });

        it('should keep both reports when fight sequences differ', () => {
            const fights1 = [
                { id: 1, encounterID: 3009, difficulty: 4, kill: true, fightPercentage: 0, startTime: 0, endTime: 120000, name: 'Vexie and the Geargrinders' }
            ];

            const fights2 = [
                { id: 1, encounterID: 3010, difficulty: 4, kill: true, fightPercentage: 0, startTime: 0, endTime: 120000, name: 'Cauldron of Carnage' }
            ];

            const report1 = createMockReport('ABC123', fights1);
            const report2 = createMockReport('DEF456', fights2);

            const result = detector.detectDuplicates([report1, report2]);

            expect(result).toHaveLength(2);
        });
    });

    describe('timing tolerance', () => {
        it('should detect duplicates within timing tolerance', () => {
            const fights1 = [
                { id: 1, encounterID: 3009, difficulty: 4, kill: true, fightPercentage: 0, startTime: 0, endTime: 120000, name: 'Vexie and the Geargrinders' }
            ];

            // 10% longer duration (within 15% tolerance)
            const fights2 = [
                { id: 1, encounterID: 3009, difficulty: 4, kill: true, fightPercentage: 0, startTime: 0, endTime: 121000, name: 'Vexie and the Geargrinders' }
            ];

            const report1 = createMockReport('ABC123', fights1);
            const report2 = createMockReport('DEF456', fights2);

            const result = detector.detectDuplicates([report1, report2]);

            expect(result).toHaveLength(1); // Should be detected as duplicates
        });

        it('should not detect duplicates when timing difference exceeds tolerance', () => {
            const fights1 = [
                { id: 1, encounterID: 3009, difficulty: 4, kill: true, fightPercentage: 0, startTime: 0, endTime: 120000, name: 'Vexie and the Geargrinders' }
            ];

            // 20% longer duration (exceeds 15% tolerance)
            const fights2 = [
                { id: 1, encounterID: 3009, difficulty: 4, kill: true, fightPercentage: 0, startTime: 0, endTime: 144000, name: 'Vexie and the Geargrinders' }
            ];

            const report1 = createMockReport('ABC123', fights1);
            const report2 = createMockReport('DEF456', fights2);

            const result = detector.detectDuplicates([report1, report2]);

            expect(result).toHaveLength(2); // Should NOT be detected as duplicates
        });
    });

    describe('fight outcome matching', () => {
        it('should not detect as duplicates when kill status differs', () => {
            const fights1 = [
                { id: 1, encounterID: 3009, difficulty: 4, kill: true, fightPercentage: 0, startTime: 0, endTime: 120000, name: 'Vexie and the Geargrinders' }
            ];

            const fights2 = [
                { id: 1, encounterID: 3009, difficulty: 4, kill: false, fightPercentage: 15.5, startTime: 0, endTime: 120000, name: 'Vexie and the Geargrinders' }
            ];

            const report1 = createMockReport('ABC123', fights1);
            const report2 = createMockReport('DEF456', fights2);

            const result = detector.detectDuplicates([report1, report2]);

            expect(result).toHaveLength(2); // Different outcomes, not duplicates
        });

        it('should detect duplicates when wipe percentages are within tolerance', () => {
            const fights1 = [
                { id: 1, encounterID: 3009, difficulty: 4, kill: false, fightPercentage: 45.2, startTime: 0, endTime: 120000, name: 'Vexie and the Geargrinders' }
            ];

            // 2% difference in wipe percentage (within 3% tolerance)
            const fights2 = [
                { id: 1, encounterID: 3009, difficulty: 4, kill: false, fightPercentage: 45.1, startTime: 0, endTime: 120000, name: 'Vexie and the Geargrinders' }
            ];

            const report1 = createMockReport('ABC123', fights1);
            const report2 = createMockReport('DEF456', fights2);

            const result = detector.detectDuplicates([report1, report2]);

            expect(result).toHaveLength(1); // Should be detected as duplicates
        });
    });

    describe('trash fight filtering', () => {
        it('should ignore trash fights in duplicate detection', () => {
            const fights1 = [
                { id: 1, encounterID: 0, difficulty: 4, kill: true, fightPercentage: 0, startTime: 0, endTime: 30000, name: 'Trash' }, // Trash fight
                { id: 2, encounterID: 3009, difficulty: 4, kill: true, fightPercentage: 0, startTime: 60000, endTime: 180000, name: 'Vexie and the Geargrinders' }
            ];

            const fights2 = [
                { id: 1, encounterID: 3009, difficulty: 4, kill: true, fightPercentage: 0, startTime: 0, endTime: 120000, name: 'Vexie and the Geargrinders' }
            ];

            const report1 = createMockReport('ABC123', fights1);
            const report2 = createMockReport('DEF456', fights2);

            const result = detector.detectDuplicates([report1, report2]);

            expect(result).toHaveLength(1); // Should be detected as duplicates (trash ignored)
        });
    });

    describe('empty reports', () => {
        it('should handle reports with no boss fights', () => {
            const report1 = createMockReport('ABC123', []);
            const report2 = createMockReport('DEF456', []);

            const result = detector.detectDuplicates([report1, report2]);

            expect(result).toHaveLength(2); // Empty reports should not be considered duplicates
        });

        it('should handle mixed empty and non-empty reports', () => {
            const report1 = createMockReport('ABC123', []);
            const report2 = createMockReport('DEF456', [
                { id: 1, encounterID: 3009, difficulty: 4, kill: true, fightPercentage: 0, startTime: 0, endTime: 120000, name: 'Vexie and the Geargrinders' }
            ]);

            const result = detector.detectDuplicates([report1, report2]);

            expect(result).toHaveLength(2); // Should keep both
        });
    });
});

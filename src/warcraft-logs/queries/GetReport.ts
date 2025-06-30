import { ChargedGigaBomb, Crushed, GarbagePile, GigaBombDetonation, HighRoller, Payline, RedAsphalt, Rolled, RollingRubbish, Screwed } from '@/app/_config/auras';
import { gql } from '@apollo/client/core';


export const CoreReportFragment = gql`
    fragment CoreReportFragment on Report {
        code
        title
        startTime
        endTime
        baseData: table (fightIDs: $bossFightIds)
        preWipeDeaths: table (fightIDs: $bossFightIds, wipeCutoff: 3, dataType: Deaths)
        casts: table (fightIDs: $bossFightIds, dataType: Casts)
        dispels: table (fightIDs: $bossFightIds, dataType: Dispels)
        interupts: table (fightIDs: $bossFightIds, dataType: Interrupts)
        damageTaken: table (fightIDs: $bossFightIds, dataType: DamageTaken)
        friendlyFire: table(fightIDs: $bossFightIds, dataType: DamageTaken filterExpression: "source.type = 'Player' and ability.name != 'Faulty Zap' and source.id != target.id")
    }
`;

export const StixGarbagePileFragment = gql`
    fragment StixGarbagePileFragment on Report {
        garbagePileApplications: table(
            fightIDs: $bossFightIds
            dataType: Debuffs
            abilityID: 464854
        )
    }
`;

export const StixRolledFragment = gql`
    fragment StixRolledFragment on Report {
        rolledApplications: events(
            fightIDs: $bossFightIds
            dataType: Debuffs
            filterExpression: "ability.id = 465611 and type = 'ApplyDebuff'"
            useActorIDs: false
        ) {
            data
        }
    }
`;

export const StixRollingRubbishFragment = gql`
    fragment StixRollingRubbishFragment on Report {
        rollingRubbish: table(
            fightIDs: $bossFightIds
            dataType: Debuffs
            abilityID: 461536
        )
    }
`;

export const SprocketScrewedFragment = gql`
    fragment SprocketScrewedFragment on Report {
        screwedApplications: table(
            fightIDs: $bossFightIds
            dataType: Debuffs
            abilityID: 1217261
        )
    }
`;

// Take totalUptime from auras, totalTime on main data object will have length of fight
export const OABHighRollerFragment = gql`
    fragment OABHighRollerFragment on Report {
        highRollerUptime: table(
            fightIDs: $bossFightIds
            dataType: Debuffs
            abilityID: 460444
        )
    }
`;

// Take totalUses from auras - All on Smacked
export const OABCrushedFragment = gql`
    fragment OABCrushedFragment on Report {
        crushedApplications: table(
            fightIDs: $bossFightIds
            dataType: Debuffs
            abilityID: 460430
        )
    }
`;

// Take total from auras
export const OABPaylineFragment = gql`
    fragment OABPaylineFragment on Report {
        paylineCasts: table(
            fightIDs: $bossFightIds
            dataType: Casts
            abilityID: 460674
        )
    }
`;

// Take total from auras
export const GallyBombFragment = gql`
    fragment GallyBombFragment on Report {
        gigaBombTosses: table(
            fightIDs: $bossFightIds
            dataType: Casts
            abilityID: 469360
        )
    }
`;

export const GallyCoilFragment = gql`
    fragment GallyCoilFragment on Report {
        coilsDestroyed: table(
            fightIDs: $bossFightIds
            dataType: Debuffs
            abilityID: 469795
        )
    }
`;

export const HitAndRunFragment = gql`
    fragment HitAndRunFragment on Report {
        hitAndRuns: table(
            fightIDs: $trashFightIds
            dataType: Deaths
            abilityID: 462797
        ) @skip(if: $skipTrashFights)
    }
`;

export const RedAsphaltFragment = gql`
    fragment RedAsphaltFragment on Report {
        redAsphaltDeaths: table(
            fightIDs: $trashFightIds
            dataType: Deaths
            abilityID: 468872
        ) @skip(if: $skipTrashFights)
    }
`;

// @ts-ignore
export const GetReport = gql`
    query getReport($reportCode: String, $bossFightIds: [Int], $trashFightIds: [Int], $buffFilter: String, $debuffFilter: String, $buffStart: Float, $debuffStart: Float, $skipTrashFights: Boolean!) {
        bossFights: reportData {
            report(code: $reportCode) {
                ...CoreReportFragment
                ...StixGarbagePileFragment
                ...StixRolledFragment
                ...StixRollingRubbishFragment
                ...SprocketScrewedFragment
                ...OABHighRollerFragment
                ...OABCrushedFragment
                ...OABPaylineFragment
                ...GallyBombFragment
                ...GallyCoilFragment
                ...HitAndRunFragment
                ...RedAsphaltFragment
                trackedDebuffs: events(fightIDs: $bossFightIds, dataType: Debuffs, filterExpression: $debuffFilter, useActorIDs: false, startTime: $debuffStart) {
                    nextPageTimestamp
                    data
                }
                trackedBuffs: events(fightIDs: $bossFightIds, dataType: Buffs, filterExpression: $buffFilter, useActorIDs: false, startTime: $buffStart) {
                    nextPageTimestamp
                    data
                }
            }
        }
    }
    ${CoreReportFragment}
    ${StixGarbagePileFragment}
    ${StixRolledFragment}
    ${StixRollingRubbishFragment}
    ${SprocketScrewedFragment}
    ${OABHighRollerFragment}
    ${OABCrushedFragment}
    ${OABPaylineFragment}
    ${GallyBombFragment}
    ${GallyCoilFragment}
    ${HitAndRunFragment}
    ${RedAsphaltFragment}
`;

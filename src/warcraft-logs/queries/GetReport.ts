import { gql } from '@apollo/client/core';


export const CoreReportFragment = gql`
    fragment CoreReportFragment on Report {
        code
        title
        startTime
        endTime
        baseData: table (fightIDs: $bossFightIds, wipeCutoff: 3)
        preWipeDeaths: table (fightIDs: $bossFightIds, wipeCutoff: 3, dataType: Deaths)
        casts: table (fightIDs: $bossFightIds, dataType: Casts)
        dispels: table (fightIDs: $bossFightIds, dataType: Dispels)
        interupts: table (fightIDs: $bossFightIds, dataType: Interrupts)
        damageTaken: table (fightIDs: $bossFightIds, dataType: DamageTaken)
        friendlyFire: table(fightIDs: $bossFightIds, dataType: DamageTaken filterExpression: "source.type = 'Player' and ability.name != 'Faulty Zap' and source.id != target.id")
    }
`;

// Midnight Season 1 - "Beamed": deaths from beam mechanics across the tier
// (Oblivion's Wrath / Void Breath / Umbral Beams / Nullbeam / Dark Quasar)
export const BeamedDeathsFragment = gql`
    fragment BeamedDeathsFragment on Report {
        beamDeaths: table(
            fightIDs: $bossFightIds
            dataType: Deaths
            filterExpression: "ability.id IN (1260712, 1256855, 1260015, 1262623, 1279420, 1285561)"
        )
    }
`;

// Midnight Season 1 - "Mom pick me up im scared": fear applications
// (Fearsome Cry on Chimaerus / Dread Breath on Vaelgor & Ezzorak)
export const FearApplicationsFragment = gql`
    fragment FearApplicationsFragment on Report {
        fearApplications: table(
            fightIDs: $bossFightIds
            dataType: Debuffs
            filterExpression: "ability.id IN (1265940, 1255979)"
        )
    }
`;

// @ts-ignore
export const GetReport = gql`
    query getReport($reportCode: String, $bossFightIds: [Int], $buffFilter: String, $debuffFilter: String, $buffStart: Float, $debuffStart: Float) {
        bossFights: reportData {
            report(code: $reportCode) {
                ...CoreReportFragment
                ...BeamedDeathsFragment
                ...FearApplicationsFragment
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
    ${BeamedDeathsFragment}
    ${FearApplicationsFragment}
`;

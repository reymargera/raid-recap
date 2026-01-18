import {
    ArcanomatrixAtomizer,
    DisplacementMatrix,
    LairWeaving,
    SoulrendOrb,
    DevourersIre,
    Frailty,
    PrimeSequence,
    RefractedEntropy,
    Oblivion,
    OverchargedMana
} from '@/app/_config/auras';
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

// Plexus Sentinel - Deaths from Atomizer
export const PlexusAtomizerDeathsFragment = gql`
    fragment PlexusAtomizerDeathsFragment on Report {
        atomizerDeaths: table(
            fightIDs: $bossFightIds
            dataType: Deaths
            abilityID: 1217649
        )
    }
`;

// Plexus Sentinel - Displacement Matrix applications
export const PlexusDisplacementMatrixFragment = gql`
    fragment PlexusDisplacementMatrixFragment on Report {
        displacementMatrixApplications: table(
            fightIDs: $bossFightIds
            dataType: Debuffs
            abilityID: 1218625
        )
    }
`;

// Loom'ithar - Lair Weaving applications
export const LoomitharLairWeavingFragment = gql`
    fragment LoomitharLairWeavingFragment on Report {
        lairWeavingApplications: table(
            fightIDs: $bossFightIds
            dataType: Debuffs
            abilityID: 1237272
        )
    }
`;

// Soulbinder - Soulrend Orb applications
export const SoulbinderSoulrendOrbFragment = gql`
    fragment SoulbinderSoulrendOrbFragment on Report {
        soulrendOrbApplications: table(
            fightIDs: $bossFightIds
            dataType: Debuffs
            abilityID: 1226827
        )
    }
`;

// Soul Hunters - Devourer's Ire applications
export const SoulHuntersDevourersIreFragment = gql`
    fragment SoulHuntersDevourersIreFragment on Report {
        devourersIreApplications: table(
            fightIDs: $bossFightIds
            dataType: Debuffs
            abilityID: 1222232
        )
    }
`;

// Soul Hunters - Frailty applications
export const SoulHuntersFrailtyFragment = gql`
    fragment SoulHuntersFrailtyFragment on Report {
        frailtyApplications: table(
            fightIDs: $bossFightIds
            dataType: Debuffs
            abilityID: 1241946
        )
    }
`;

// Forgeweaver - Prime Sequence damage
export const ForgeweaverPrimeSequenceFragment = gql`
    fragment ForgeweaverPrimeSequenceFragment on Report {
        primeSequenceDamage: table(
            fightIDs: $bossFightIds
            dataType: DamageTaken
            abilityID: 1237322
        )
    }
`;

// Fractillus - Refracted Entropy damage
export const FractillusRefractedEntropyFragment = gql`
    fragment FractillusRefractedEntropyFragment on Report {
        refractedEntropyDamage: table(
            fightIDs: $bossFightIds
            dataType: DamageTaken
            abilityID: 1241137
        )
    }
`;

// Dimensius - Oblivion deaths
export const DimensiusOblivionDeathsFragment = gql`
    fragment DimensiusOblivionDeathsFragment on Report {
        oblivionDeaths: table(
            fightIDs: $bossFightIds
            dataType: Deaths
            abilityID: 1229327
        )
    }
`;

// Trash - Overcharged Mana deaths
export const TrashOverchargedManaDeathsFragment = gql`
    fragment TrashOverchargedManaDeathsFragment on Report {
        overchargedManaDeaths: table(
            fightIDs: $trashFightIds
            dataType: Deaths
            abilityID: 1237718
        ) @skip(if: $skipTrashFights)
    }
`;

// @ts-ignore
export const GetReport = gql`
    query getReport($reportCode: String, $bossFightIds: [Int], $trashFightIds: [Int], $buffFilter: String, $debuffFilter: String, $buffStart: Float, $debuffStart: Float, $skipTrashFights: Boolean!) {
        bossFights: reportData {
            report(code: $reportCode) {
                ...CoreReportFragment
                ...PlexusAtomizerDeathsFragment
                ...PlexusDisplacementMatrixFragment
                ...LoomitharLairWeavingFragment
                ...SoulbinderSoulrendOrbFragment
                ...SoulHuntersDevourersIreFragment
                ...SoulHuntersFrailtyFragment
                ...ForgeweaverPrimeSequenceFragment
                ...FractillusRefractedEntropyFragment
                ...DimensiusOblivionDeathsFragment
                ...TrashOverchargedManaDeathsFragment
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
    ${PlexusAtomizerDeathsFragment}
    ${PlexusDisplacementMatrixFragment}
    ${LoomitharLairWeavingFragment}
    ${SoulbinderSoulrendOrbFragment}
    ${SoulHuntersDevourersIreFragment}
    ${SoulHuntersFrailtyFragment}
    ${ForgeweaverPrimeSequenceFragment}
    ${FractillusRefractedEntropyFragment}
    ${DimensiusOblivionDeathsFragment}
    ${TrashOverchargedManaDeathsFragment}
`;

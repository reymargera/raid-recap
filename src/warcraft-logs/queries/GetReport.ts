import gql from '@apollo/client/core';


export const GetReport = gql`
    query getReport($reportCode: String, $bossFightIds: [Int], $trashFightIds: [Int]) {
        bossFights: reportData {
            report(code: $reportCode) {
                code
                title
                startTime
                endTime
                baseData: table(fightIDs: $bossFightIds)
                preWipeDeaths: table(fightIDs: $bossFightIds, wipeCutoff: 3, dataType: Deaths)
                casts: table(fightIDs: $bossFightIds, dataType: Casts)
                dispels: table(fightIDs: $bossFightIds, dataType: Dispels)
                interupts: table(fightIDs: $bossFightIds, dataType: Interrupts)
                threat: table(fightIDs: $bossFightIds, dataType: Threat)
                damageTaken: table(fightIDs: $bossFightIds, dataType: DamageTaken)
            }
        }
        trashFights: reportData {
            report(code: $reportCode) {
                code
                title
                startTime
                endTime
                baseData: table(fightIDs: $trashFightIds)
                casts: table(fightIDs: $trashFightIds, dataType: Casts)
                dispels: table(fightIDs: $trashFightIds, dataType: Dispels)
                interupts: table(fightIDs: $trashFightIds, dataType: Interrupts)
                threat: table(fightIDs: $trashFightIds, dataType: Threat)
                damageTaken: table(fightIDs: $trashFightIds, dataType: DamageTaken)
            }
        }
    }
`;

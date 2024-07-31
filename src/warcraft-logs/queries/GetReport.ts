import gql from '@apollo/client/core';


export const GetReport = gql`
    query getReport($reportCode: String, $bossFightIds: [Int], $trashFightIds: [Int], $buffFilter: String, $debuffFilter: String, $fireFilter: String) {
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
                trackedDebuffs: events(fightIDs: $bossFightIds, dataType: Debuffs, filterExpression: $debuffFilter, useActorIDs: false) {
                    data
                }
                trackedBuffs: events(fightIDs: $bossFightIds, dataType: Buffs, filterExpression: $buffFilter, useActorIDs: false) {
                    data
                }
                fireDamage: table(fightIDs: $bossFightIds, dataType: DamageTaken, filterExpression: $fireFilter)
                friendlyFire: table(fightIDs: $bossFightIds, dataType: DamageDone, targetClass: "Player", viewBy: Source, filterExpression: "source.id != target.id")
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

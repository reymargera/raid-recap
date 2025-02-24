import { gql } from '@apollo/client/core';

// @ts-ignore
export const GetReport = gql`
    query getReport($reportCode: String, $bossFightIds: [Int], $trashFightIds: [Int], $buffFilter: String, $debuffFilter: String, $buffStart: Float, $debuffStart: Float) {
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
                damageTaken: table(fightIDs: $bossFightIds, dataType: DamageTaken)
                daggerDamageTaken: table(fightIDs: $bossFightIds, dataType: DamageTaken, abilityID: 440149)
                trackedDebuffs: events(fightIDs: $bossFightIds, dataType: Debuffs, filterExpression: $debuffFilter, useActorIDs: false, startTime: $debuffStart) {
                    nextPageTimestamp
                    data
                }
                trackedBuffs: events(fightIDs: $bossFightIds, dataType: Buffs, filterExpression: $buffFilter, useActorIDs: false, startTime: $buffStart) {
                    nextPageTimestamp
                    data
                }
                friendlyFire: table(fightIDs: $bossFightIds, dataType: DamageDone, targetClass: "Player", viewBy: Source, filterExpression: "source.id != target.id")
                chargeWebs: events(fightIDs: $bossFightIds, dataType: Debuffs, filterExpression: "IN RANGE WHEN type = 'applydebuff' AND ability.id = '440001' FROM type = 'applydebuff' AND ability.id= '460360' TO type = 'removedebuff' AND ability.id= '460360' GROUP BY target END", useActorIDs: false) {
                    data
                }
                phaseBlades: events(fightIDs: $bossFightIds, dataType: Debuffs, filterExpression: "type = 'applydebuffstack' AND ability.id = '434860'", useActorIDs: false) {
                    data
                }
                bombsThrown: events(fightIDs: $trashFightIds, filterExpression: "type = 'applydebuff' AND ability.id = '459504' AND target.type != 'NPC'", useActorIDs: false) {
                    data
                }
            }
        }
    }
`;

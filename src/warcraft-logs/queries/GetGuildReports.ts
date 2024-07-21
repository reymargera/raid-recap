import {gql} from "@apollo/client/core";

export const GetReportsForGuild = gql`
    query getReportsForGuild($guildId: Int, $seasonStartTime: Float) {
        reportData {
            reports (guildID: $guildId, startTime: $seasonStartTime, limit: 50) {
                total
                data {
                    code
                    title
                    owner {
                        id
                        name
                    }
                    fights {
                        id
                        name
                        difficulty
                        encounterID
                        fightPercentage
                        kill
                        startTime
                        endTime
                    }
                }
            }
        }
    }
`;

import {gql} from "@apollo/client/core";

export const GetReportsForGuild = gql`
    query getReportsForGuild($guildId: Int, $seasonStartTime: Float, $page: Int) {
        reportData {
            reports (guildID: $guildId, startTime: $seasonStartTime, limit: 50, page: $page) {
                total
                hasMorePages: has_more_pages
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

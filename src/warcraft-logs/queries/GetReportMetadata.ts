import {gql} from "@apollo/client/core";

export const GetReportMetadata = gql`
    query getReportMetadata($reportCode: String!) {
        reportData {
            report(code: $reportCode) {
                code
                title
                startTime
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
`;

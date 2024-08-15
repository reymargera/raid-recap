import {ApolloClient, InMemoryCache} from "@apollo/client";
import {
    GetReportDocument,
    GetReportQuery,
    GetReportQueryVariables,
    GetReportsForGuildDocument,
    GetReportsForGuildQueryVariables,
    Report
} from "@/__generated__/graphql";

export class WarcraftLogsClient {

    private client: ApolloClient<any>;

    constructor() {
        this.client = new ApolloClient({
            uri: 'https://www.warcraftlogs.com/api/v2/client',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.TOKEN}`,
            },
            cache: new InMemoryCache(),
        });
    }

    public async getReportsForGuild({ guildId, seasonStartTime } : GetReportsForGuildQueryVariables): Promise<Report[]> {
        console.log(`Executing request to fetch logs for guild ${guildId}`);

        const result = await this.client.query({
           query: GetReportsForGuildDocument,
           variables: {
               guildId,
               seasonStartTime,
           }
        });

        const reports: Report[] = (result.data.reportData?.reports?.data ?? []) as Report[];

        console.log(`Found a total of ${reports.length} reports for guild ${guildId}`);

        return reports;
    }

    public async getReport({reportCode, trashFightIds, bossFightIds, debuffFilter, buffFilter, fireFilter}: GetReportQueryVariables): Promise<GetReportQuery> {
        console.log(`Executing request to fetch logs for report ${reportCode}`);

        try {
            const result = await this.client.query({
                query: GetReportDocument,
                variables: {
                    reportCode,
                    trashFightIds,
                    bossFightIds,
                    debuffFilter,
                    buffFilter,
                    fireFilter,
                }
            });

            console.log(`Successfully pulled data for report ${reportCode}`);

            return result.data;
        } catch (error) {
            console.error(`Failed to fetch report ${reportCode}`, error);
            throw error;
        }
    }
}

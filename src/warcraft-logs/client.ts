import {ApolloClient, ApolloQueryResult, InMemoryCache} from "@apollo/client";
import {
    GetReportDocument,
    GetReportQuery,
    GetReportQueryVariables,
    GetReportsForGuildDocument,
    GetReportsForGuildQueryVariables,
    Report
} from "@/__generated__/graphql";
import Bottleneck from "bottleneck";


const useRateLimiter = process.env.NODE_ENV === 'production';

const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 500,
});

export class WarcraftLogsClient {

    private client: ApolloClient<any>;

    constructor() {
        this.client = new ApolloClient({
            uri: 'https://www.warcraftlogs.com/api/v2/client',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.TOKEN}`,
            },
            cache: new InMemoryCache({
                typePolicies: {
                    ReportPagination: {
                        fields: {
                            data: {
                                keyArgs: false,
                                merge(existing = [], incoming) {
                                    return [...existing, ...incoming];
                                }
                            }
                        }
                    },
                    Report: {
                        keyFields: ["code"],
                        fields: {
                            fights: {
                                keyArgs: false, // Prevent fights from being cached separately per query args
                            }
                        }
                    },
                    ReportFight: {
                        keyFields: false
                    },
                    ReportData: {
                        keyFields: false,
                        fields: {
                            reports: {
                                keyArgs: ["guildId", "startTime", "page", "limit"],
                            }
                        }
                    },
                    Query: {
                        fields: {
                            reportData: {
                                keyArgs: false,
                            }
                        }
                    }
                }
            })
        });
    }

    public async getReportsForGuild({guildId, seasonStartTime}: GetReportsForGuildQueryVariables): Promise<Report[]> {
        console.log(`Executing request to fetch logs for guild ${guildId}`);

        let page = 1;
        let queryPage = true;
        const allReports: Report[] = [];

        do {
            const result = await this.client.query({
                query: GetReportsForGuildDocument,
                variables: {
                    guildId,
                    seasonStartTime,
                    page,
                }
            });

            const reports: Report[] = (result.data.reportData?.reports?.data ?? []) as Report[];
            allReports.push(...reports);

            console.log(`Found a total of ${reports.length} reports for guild ${guildId} on page ${page}`);

            queryPage = result.data?.reportData?.reports?.hasMorePages || false;
            page++;
        } while (queryPage)


        console.log(`Found a total of ${allReports.length} reports for guild ${guildId}`);

        return allReports;
    }

    private async scheduleQuery<T>(query: () => Promise<T>): Promise<T> {
        if (useRateLimiter) {
            return limiter.schedule(query);
        } else {
            return query();
        }
    }

    public async getReport({reportCode, bossFightIds, debuffFilter, buffFilter}: GetReportQueryVariables): Promise<GetReportQuery> {
        console.log(`Executing request to fetch logs for report ${reportCode}`);

        let buffStart: any = null;
        let debuffStart: any = null;

        const allBuffData: any[] = [];
        const allDebuffData: any[] = [];
        let coreReport: GetReportQuery | null = null;

        do {
            const result: ApolloQueryResult<GetReportQuery> = await this.scheduleQuery(() => this.client.query({
                query: GetReportDocument,
                variables: {
                    reportCode,
                    bossFightIds,
                    debuffFilter,
                    buffFilter,
                    buffStart,
                    debuffStart,
                }
            }));

            const buffData = result.data.bossFights?.report?.trackedBuffs?.data || [];
            const debuffData = result.data.bossFights?.report?.trackedDebuffs?.data || [];

            // Save report data for initial request
            if (coreReport === null) {
                coreReport = JSON.parse(JSON.stringify(result.data));
            }

            // On initial request save buff data, for subsequent requests only save if the request is new a.k.a token was not reset to null
            if (allBuffData.length === 0 || buffStart) {
                allBuffData.push(...buffData);
            }

            if (allDebuffData.length === 0 || debuffStart) {
                allDebuffData.push(...debuffData);
            }

            // Capture next timestamp tokens to see if we need to make more requests, if any of them are set, we need to redo the request from that timestamp
            buffStart = result.data.bossFights?.report?.trackedBuffs?.nextPageTimestamp;
            debuffStart = result.data.bossFights?.report?.trackedDebuffs?.nextPageTimestamp;

            if (buffStart || debuffStart) {
                console.log(`Request did not return all event data (buffs: ${!buffStart}, debuffs: ${!debuffStart}), re-executing request to fetch additional data`);
            }
        } while (buffStart || debuffStart)

        if (coreReport !== null && coreReport.bossFights?.report?.trackedBuffs) {
            //coreReport = Object.assign({}, coreReport, { bossFights: { report: { trackedBuffs: { data: allBuffData }}}});
            coreReport.bossFights.report.trackedBuffs.data = allBuffData;
        }

        if (coreReport !== null && coreReport.bossFights?.report?.trackedDebuffs) {
            coreReport.bossFights.report.trackedDebuffs.data = allDebuffData;
        }

        return coreReport!;
    }
}

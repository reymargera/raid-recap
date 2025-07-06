import { GetReportQuery } from "@/__generated__/graphql";

export class TeamStats {

    /**
     * Takes in top level report data to capture raid night specific data, such as total number of raid nights,
     * time spent pulling bosses, total time, longest boss fight kill, shortest boss fight kill, lowest wipe,
     * total number of assumed resets
     * @param reports List of reports that coorespond to raid nights a particular team has had
     */
    public addRaidNights(reports: Report[]) {

    }

    /**
     * Takes in a low level report to extract stats such as unique number of charcters, unique specs,
     * top 5 damage taken abilities, top 5 death abilities, unique number of talent load outs, most used
     * @param report Lower level report data that cooresponds to a raid night
     */
    public addReport(report: GetReportQuery) {

    }
}

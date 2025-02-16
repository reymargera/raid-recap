import {Report} from "@/__generated__/graphql";

export interface TeamConfig {
    readonly id: string;
    readonly name: string;
    readonly guildId: number;
    readonly reportFilter?: (report: Report) => boolean;
    readonly attendancePercent?: number;
    readonly alts?: { [key: string]: string[]; };
    readonly logo?: string;
    readonly attendanceIncludeOverride?: number[];
    readonly attendanceExcludeOverride?: number[];
}

export const RaidTeams: { [key: string]: TeamConfig } = {
    'shadow-hunters-gold-team': {
        id: 'shadow-hunters-gold-team',
        name: 'Shadow Hunters Gold Team',
        logo: 'gold-team.png',
        guildId: 44873,
        reportFilter: (report: Report) => report.title.includes("Gold"),
        attendancePercent: 0.4,

        // Current Roster
        attendanceIncludeOverride: [
            247286065,
            250133977,
            232875134,
            253177181,
            177184866,
            213520423,
            30665709,
            129928572,
            252582398,
            163879647,
            259255913,
            166537423,
            232360078,
            105638034,
            170800655,
            200938322,
            211685908,
            167127672,
            184678898,
            191661603
        ],

        // Old Roster
        attendanceExcludeOverride: [
            244327809,
            214230631,
            244937869,
            247005146,
        ],
    },
    'shadow-hunters-blue-team': {
        id: 'shadow-hunters-blue-team',
        name: 'Shadow Hunters Blue Team',
        logo: 'blue-team.png',
        guildId: 44873,
        reportFilter: (report: Report) => report.title.includes("Blue"),
        attendancePercent: 0.4,
    },
    'shadow-hunters-green-team': {
        id: 'shadow-hunters-green-team',
        name: 'Shadow Hunters Green Team',
        logo: 'green-team.PNG',
        guildId: 44873,
        reportFilter: (report: Report) => report.title.includes("Green"),
        attendancePercent: 0.4,
    },
};

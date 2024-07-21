import {Report} from "@/__generated__/graphql";

export interface TeamConfig {
    readonly id: string;
    readonly name: string;
    readonly guildId: number;
    readonly reportFilter?: (report: Report) => boolean;
    readonly attendancePercent?: number;
}

export const RaidTeams: { [key: string]: TeamConfig } = {
    'shadow-hunters-gold-team': {
        id: 'shadow-hunters-gold-team',
        name: 'Shadow Hunters Gold Team',
        guildId: 44873,
        reportFilter: (report: Report) => report.title.includes("Gold") && report?.owner?.id === 1476581,
        attendancePercent: 0.6,
    },
    'shadow-hunters-blue-team': {
        id: 'shadow-hunters-blue-team',
        name: 'Shadow Hunters Blue Team',
        guildId: 44873,
        reportFilter: (report: Report) => report.title.includes("Gold") && report?.owner?.id === 1476581,
    },
    'shadow-hunters-green-team': {
        id: 'shadow-hunters-green-team',
        name: 'Shadow Hunters Green Team',
        guildId: 44873,
        reportFilter: (report: Report) => report.title.includes("Gold") && report?.owner?.id === 1476581,
    },
    'mostly-mediocre-team-1': {
        id: 'mostly-mediocre-team-1',
        name: 'Mostly Mediocre Raid Team 1',
        guildId: 44873,
        reportFilter: (report: Report) => report.title.includes("Gold") && report?.owner?.id === 1476581,
    },
};

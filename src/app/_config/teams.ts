import {Report} from "@/__generated__/graphql";

export interface TeamConfig {
    readonly id: string;
    readonly name: string;
    readonly guildId: number;
    readonly reportFilter?: (report: Report) => boolean;
    readonly attendancePercent?: number;
    readonly alts?: { [key: string]: string[]; };
    readonly logo?: string;
}

export const RaidTeams: { [key: string]: TeamConfig } = {
    'shadow-hunters-gold-team': {
        id: 'shadow-hunters-gold-team',
        name: 'Shadow Hunters Gold Team',
        logo: 'gold-team.png',
        guildId: 44873,
        reportFilter: (report: Report) => report.title.includes("Gold"),
        attendancePercent: 0.4,
        alts: {
            'Tadarlis': ['Tadaflinn'],
            'Semetare': ['Arhandeo'],
            'Holycenter': ['Centerblast'],
            'Tiamoamore': ['Baciami'],
            'Carcinogenz': ['Valhealla'],
            'Gialiana': ['Auyriella'],
            'Azzâ': ['Palyvain'],
            'Zakkeshien': ['Volcaanis'],
            'Flibbidan': ['Flibbit'],
            'Edlights': ['Edyd'],
        }
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

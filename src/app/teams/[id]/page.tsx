import AwardSlides from '../../_components/award-slide/slides';

import 'swiper/css';
import 'swiper/css/pagination';
import {fetchTeamStats} from "@/app/teams/[id]/log-puller";
import {PlayerStats} from "@/warcraft-logs/model/player-stats";
import {RaidTeams, TeamConfig} from "@/app/_config/teams";

export interface TeamPageParams {
    readonly id: string;
}

export interface Team {
    readonly id: string;
    readonly name: string;
    readonly stats: string[];
}

// Don't fall back to runtime rendering when a path was not pre-rendered
export const dynamicParams = false;

export default async function Team({params}: { params: TeamPageParams }) {
    const teamConfig = RaidTeams[params.id];
    const team = await getTeam(teamConfig);

    return (
        <>
            <AwardSlides team={team} />
        </>
    );
};

export async function generateStaticParams(): Promise<TeamPageParams[]> {
    return Object.keys(RaidTeams).map(k => ({id: k}));
}

export async function getTeam(teamConfig: TeamConfig): Promise<Team> {
    const teamStats = await fetchTeamStats({
        guildId: teamConfig.guildId,
        reportFilter: teamConfig.reportFilter,
        attendancePercent: teamConfig.attendancePercent,
    });

    return {
        id: teamConfig.id,
        name: teamConfig.name,

        // Need to serialize stats since you cant pass classes between client/server components
        stats: teamStats.map(ps => JSON.stringify(ps)),
    };
}

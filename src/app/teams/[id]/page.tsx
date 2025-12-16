import AwardSlides from '../../_components/award-slide/slides';

import 'swiper/css';
import 'swiper/css/pagination';
import {RaidTeams} from "@/app/_config/teams";
import {getTeamStats} from "@/actions/team-actions";

export interface TeamPageParams {
    readonly id: string;
}

export interface Team {
    readonly id: string;
    readonly name: string;
    readonly stats: string[];
    readonly teamStats: string;
}

export default async function Team({ params }: { params: Promise<TeamPageParams> }) {
    const teamId = (await params).id;

    // Fetch aggregated stats from database
    const { team, playerStats, teamStats } = await getTeamStats(teamId);

    // Format data for AwardSlides component
    const teamData: Team = {
        id: team.id,
        name: team.name,
        stats: playerStats,
        teamStats: teamStats || '{}',
    };

    return (
        <>
            <AwardSlides team={teamData} />
        </>
    );
};

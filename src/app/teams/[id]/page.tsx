export interface TeamPageParams {
    readonly id: string;
}

export interface Team {
    readonly id: string;
    readonly name: string;
}

// Don't fall back to runtime rendering when a path was not pre-rendered
export const dynamicParams = false;

export default async function Team({params}: { params: TeamPageParams }) {
    const team = await getTeam(params);

    // TODO: Remove placeholder
    return (
        <div>
            <h1>{team.id}</h1>
            <h1>{team.name}</h1>
        </div>
    );
};

export async function generateStaticParams(): Promise<TeamPageParams[]> {
    // TODO: Load Teams to pull data for
    const paths = [
        {id: 'shadow-hunters-gold-team'},
        {id: 'shadow-hunters-blue-team'},
        {id: 'shadow-hunters-green-team'},
        {id: 'mostly-mediocre-team-1'},
    ];

    return paths;
}

export async function getTeam(teamPageParams: TeamPageParams): Promise<Team> {
    // TODO: Leverage log fetching and extraction
    const team = { id: teamPageParams.id, name: teamPageParams.id.toUpperCase()}

    return team;
}

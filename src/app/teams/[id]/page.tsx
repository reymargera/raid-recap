'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import TeamLandingPage from '../../_components/team-landing/team-landing-page';
import { publicBase } from '@/app/_config/paths';
import { RaidTeams } from '@/app/_config/teams';

export interface TeamStatsResponse {
    team: {
        id: string;
        name: string;
        guildId: number;
        createdAt: string;
        lastUpdated: string;
    };
    playerStats: unknown[];
    teamStats: string;
}

export default function Team() {
    const params = useParams();
    const teamId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [teamData, setTeamData] = useState<{ id: string; name: string; guildId: number } | null>(null);
    const [teamStats, setTeamStats] = useState<unknown>(null);

    useEffect(() => {
        async function fetchTeamData() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${publicBase}/api/teams/${teamId}/stats`);

                if (!response.ok) {
                    if (response.status === 404) {
                        // Team not in database, try to get from config
                        const configTeam = Object.values(RaidTeams).find(t => t.id === teamId);
                        if (configTeam) {
                            setTeamData({
                                id: configTeam.id,
                                name: configTeam.name,
                                guildId: configTeam.guildId
                            });
                            setTeamStats(null);
                            setLoading(false);
                            return;
                        }
                        throw new Error('Team not found');
                    }
                    throw new Error(`Failed to fetch team data: ${response.statusText}`);
                }

                const data: TeamStatsResponse = await response.json();

                setTeamData({
                    id: data.team.id,
                    name: data.team.name,
                    guildId: data.team.guildId
                });

                // Parse teamStats if it's a string
                if (data.teamStats) {
                    try {
                        const parsedStats = typeof data.teamStats === 'string'
                            ? JSON.parse(data.teamStats)
                            : data.teamStats;
                        setTeamStats(parsedStats);
                    } catch {
                        setTeamStats(null);
                    }
                } else {
                    setTeamStats(null);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        }

        if (teamId) {
            fetchTeamData();
        }
    }, [teamId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading team data...</p>
                </div>
            </div>
        );
    }

    if (error || !teamData) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="bg-black/70 backdrop-blur-sm rounded-lg p-8 border border-red-500/30 text-center max-w-md">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
                    <p className="text-gray-400">{error || 'Failed to load team data'}</p>
                    <a href={`${publicBase}/`} className="inline-block mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                        Return Home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <TeamLandingPage
            team={teamData}
            teamStats={teamStats as Parameters<typeof TeamLandingPage>[0]['teamStats']}
        />
    );
}

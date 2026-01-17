import { NextRequest, NextResponse } from 'next/server';
import { TeamService } from '@/lib/services/team-service';
import { StatsService } from '@/lib/services/stats-service';

/**
 * Roster member type for the API response
 */
interface RosterMember {
  playerId: number;
  playerName: string;
  server: string;
  playerClass: string;
}

/**
 * Extracts roster data from serialized player stats
 */
function extractRosterFromPlayerStats(playerStatsJson: string[]): RosterMember[] {
  return playerStatsJson.map((json) => {
    const parsed = JSON.parse(json);
    return {
      playerId: parsed._id,
      playerName: parsed._name,
      server: parsed._server,
      playerClass: parsed._playerClass,
    };
  });
}

/**
 * GET /api/teams/:id/stats
 * Fetch aggregated player stats and team stats for a team
 * Applies attendance filtering based on team config
 * Also returns roster data for the filtered players
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const teamService = new TeamService();
    const team = await teamService.getTeamById(id);

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    const statsService = new StatsService();
    const stats = await statsService.getFilteredStats(id, {
      attendancePercent: team.attendancePercent,
      attendanceIncludeIds: team.attendanceIncludeIds ?? [],
      attendanceExcludeIds: team.attendanceExcludeIds ?? [],
    });

    // Extract roster data from filtered player stats
    const roster = extractRosterFromPlayerStats(stats.playerStats);

    return NextResponse.json({
      team,
      ...stats,
      roster,
    });
  } catch (error) {
    console.error('Error fetching team stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team stats' },
      { status: 500 }
    );
  }
}

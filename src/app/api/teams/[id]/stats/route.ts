import { NextRequest, NextResponse } from 'next/server';
import { TeamService } from '@/lib/services/team-service';
import { StatsService } from '@/lib/services/stats-service';

/**
 * GET /api/teams/:id/stats
 * Fetch aggregated player stats and team stats for a team
 * Applies attendance filtering based on team config
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

    return NextResponse.json({
      team,
      ...stats,
    });
  } catch (error) {
    console.error('Error fetching team stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team stats' },
      { status: 500 }
    );
  }
}

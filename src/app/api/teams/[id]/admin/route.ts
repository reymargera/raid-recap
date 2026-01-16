import { NextRequest, NextResponse } from 'next/server';
import { TeamService } from '@/lib/services/team-service';
import { authorizeProcessLogs } from '@/lib/auth-helpers';

/**
 * GET /api/teams/:id/admin
 * Fetch team config and roster for admin UI
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || /^\s.*$/.test(id)) {
      return NextResponse.json(
        { error: 'Provided team id is invalid' },
        { status: 400 },
      );
    }

    const teamService = new TeamService();
    const team = await teamService.getTeamById(id);

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    const roster = await teamService.getUniquePlayersForTeam(id);

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        attendancePercent: team.attendancePercent,
        attendanceIncludeIds: team.attendanceIncludeIds,
        attendanceExcludeIds: team.attendanceExcludeIds,
      },
      roster,
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin data' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/teams/:id/admin
 * Update team attendance config
 * Requires team admin or super admin authorization
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || /^\s.*$/.test(id)) {
      return NextResponse.json(
        { error: 'Provided team id is invalid' },
        { status: 400 },
      );
    }

    // Authorization check
    const auth = await authorizeProcessLogs(request, id);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be a team admin to update settings.' },
        { status: 401 }
      );
    }

    const body = await request.json() as {
      attendancePercent?: number;
      attendanceIncludeIds?: number[];
      attendanceExcludeIds?: number[];
    };
    const { attendancePercent, attendanceIncludeIds, attendanceExcludeIds } = body;

    const teamService = new TeamService();

    const team = await teamService.getTeamById(id);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    const updatedTeam = await teamService.updateTeam(id, {
      attendancePercent,
      attendanceIncludeIds,
      attendanceExcludeIds,
    });

    return NextResponse.json({
      team: {
        id: updatedTeam?.id,
        name: updatedTeam?.name,
        attendancePercent: updatedTeam?.attendancePercent,
        attendanceIncludeIds: updatedTeam?.attendanceIncludeIds,
        attendanceExcludeIds: updatedTeam?.attendanceExcludeIds,
      },
    });
  } catch (error) {
    console.error('Error updating team config:', error);
    return NextResponse.json(
      { error: 'Failed to update team config' },
      { status: 500 }
    );
  }
}

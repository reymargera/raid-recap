import { NextRequest, NextResponse } from 'next/server';
import { TeamService } from '@/lib/services/team-service';

/**
 * GET /api/teams/:id
 * Fetch basic team metadata (name, guildId, season, etc.)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`Fetching team details for ${id}`);
    if (!isTeamIdValid(id)) {
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

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team data' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/teams/:id
 * Update team metadata (name, description, etc.)
 * TODO: Add authentication before implementing
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    { error: 'Not implemented - authentication required' },
    { status: 501 }
  );
}

const isTeamIdValid = (id: string) => {
  return id && !/^\s.*$/.test(id);
}

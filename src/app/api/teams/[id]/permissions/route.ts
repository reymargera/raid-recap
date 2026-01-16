import { NextRequest, NextResponse } from 'next/server';
import { getSession, canProcessLogs } from '@/lib/auth-helpers';

/**
 * GET /api/teams/:id/permissions
 * Check user's permissions for a specific team
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;

    if (!teamId || /^\s.*$/.test(teamId)) {
      return NextResponse.json(
        { error: 'Invalid team ID' },
        { status: 400 }
      );
    }

    const session = await getSession(request);

    // Not authenticated - no permissions
    if (!session.authenticated || !session.userId) {
      return NextResponse.json({
        canUploadLogs: false,
        canEditConfig: false,
        isTeamAdmin: false,
        isSuperAdmin: false,
      });
    }

    // Check if user can process logs for this team
    const hasTeamAccess = await canProcessLogs(session.userId, teamId);

    return NextResponse.json({
      canUploadLogs: hasTeamAccess,
      canEditConfig: hasTeamAccess,
      isTeamAdmin: hasTeamAccess && !session.isSuperAdmin,
      isSuperAdmin: session.isSuperAdmin ?? false,
    });
  } catch (error) {
    console.error('Error checking permissions:', error);
    return NextResponse.json(
      { error: 'Failed to check permissions' },
      { status: 500 }
    );
  }
}

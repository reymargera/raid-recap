import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB } from '@/lib/db';
import { teamHighlights } from '@/lib/db/schema';
import { getSession, canProcessLogs } from '@/lib/auth-helpers';
import { eq, and } from 'drizzle-orm';

/**
 * DELETE /api/teams/:id/highlights/:highlightId
 * Delete a highlight (requires authentication, user must be submitter or team admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; highlightId: string }> }
) {
  try {
    const { id: teamId, highlightId } = await params;

    if (!teamId || /^\s.*$/.test(teamId)) {
      return NextResponse.json(
        { error: 'Invalid team ID' },
        { status: 400 }
      );
    }

    if (!highlightId || /^\s.*$/.test(highlightId)) {
      return NextResponse.json(
        { error: 'Invalid highlight ID' },
        { status: 400 }
      );
    }

    // Require authentication
    const session = await getSession(request);
    if (!session.authenticated || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { env } = getCloudflareContext();
    const db = getDB(env.DB);

    // Fetch the highlight to check ownership
    const highlight = await db
      .select()
      .from(teamHighlights)
      .where(and(
        eq(teamHighlights.id, highlightId),
        eq(teamHighlights.teamId, teamId)
      ))
      .get();

    if (!highlight) {
      return NextResponse.json(
        { error: 'Highlight not found' },
        { status: 404 }
      );
    }

    // Check permissions: submitter OR team admin can delete
    const isSubmitter = highlight.submittedBy === session.userId;
    const isTeamAdmin = await canProcessLogs(session.userId, teamId);

    if (!isSubmitter && !isTeamAdmin) {
      return NextResponse.json(
        { error: 'Only the submitter or team admin can delete this highlight' },
        { status: 403 }
      );
    }

    // Delete the highlight
    await db
      .delete(teamHighlights)
      .where(eq(teamHighlights.id, highlightId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting highlight:', error);
    return NextResponse.json(
      { error: 'Failed to delete highlight' },
      { status: 500 }
    );
  }
}

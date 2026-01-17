import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB } from '@/lib/db';
import { teamHighlights, insertTeamHighlightSchema } from '@/lib/db/schema';
import { getSession } from '@/lib/auth-helpers';
import { getYouTubeVideoId } from '@/app/_config/highlights';
import { eq, desc } from 'drizzle-orm';

/**
 * GET /api/teams/:id/highlights
 * Fetch all highlights for a team (public, no auth required)
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

    const { env } = getCloudflareContext();
    const db = getDB(env.DB);

    const highlights = await db
      .select()
      .from(teamHighlights)
      .where(eq(teamHighlights.teamId, teamId))
      .orderBy(desc(teamHighlights.createdAt));

    return NextResponse.json({ highlights });
  } catch (error) {
    console.error('Error fetching highlights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch highlights' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teams/:id/highlights
 * Create a new highlight (requires authentication)
 */
export async function POST(
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

    // Require authentication
    const session = await getSession(request);
    if (!session.authenticated || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json() as Record<string, unknown>;

    // Validate input
    const parseResult = insertTeamHighlightSchema.safeParse({
      id: crypto.randomUUID(),
      teamId,
      submittedBy: session.userId,
      ...body,
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    // Validate YouTube URL
    const videoId = getYouTubeVideoId(parseResult.data.videoUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const db = getDB(env.DB);

    // Insert highlight
    await db.insert(teamHighlights).values(parseResult.data);

    return NextResponse.json(
      { success: true, id: parseResult.data.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating highlight:', error);
    return NextResponse.json(
      { error: 'Failed to create highlight' },
      { status: 500 }
    );
  }
}

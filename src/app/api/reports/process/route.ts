import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { z } from 'zod';
import { authorizeProcessLogs } from '@/lib/auth-helpers';

const processReportSchema = z.object({
  teamId: z.string().regex(/^\S+$/, 'Invalid team ID'),
  reportCode: z.string().regex(/^[a-zA-Z0-9]+$/, 'Invalid report code'),
  season: z.string().optional().default('season-3'),
});

/**
 * POST /api/reports/process
 * Trigger a Cloudflare Workflow to process a Warcraft Logs report
 *
 * Auth: Requires either:
 * - Valid Battle.net OAuth session (super admin or team admin)
 * - X-API-Key header (for CLI/automation)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = processReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { teamId, reportCode, season } = validation.data;

    // Check authorization (OAuth session or API key)
    const auth = await authorizeProcessLogs(request, teamId);

    if (!auth.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Login with Battle.net or provide valid API key.' },
        { status: 401 }
      );
    }

    const { env } = getCloudflareContext();

    const instance = await env.WORKFLOWS.create({
      params: { teamId, reportCode, season }
    });

    return NextResponse.json({
      workflowId: instance.id,
      status: 'processing',
    });
  } catch (error) {
    console.error('Error starting workflow:', error);
    return NextResponse.json(
      { error: 'Failed to start report processing' },
      { status: 500 }
    );
  }
}

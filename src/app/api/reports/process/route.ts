import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { z } from 'zod';

const processReportSchema = z.object({
  teamId: z.string().regex(/^\S+$/, 'Invalid team ID'),
  reportCode: z.string().regex(/^[a-zA-Z0-9]+$/, 'Invalid report code'),
  season: z.string().optional().default('season-3'),
});

/**
 * POST /api/reports/process
 * Trigger a Cloudflare Workflow to process a Warcraft Logs report
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = processReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { teamId, reportCode, season } = validation.data;

    // Get Cloudflare context and trigger workflow
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

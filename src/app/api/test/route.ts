import { NextRequest, NextResponse } from 'next/server';
import { processReport } from '@/actions/team-actions';
import { z } from 'zod';


const processReportSchema = z.object({
  teamId: z.string().regex(/^\S+$/, 'Invalid team ID'),
  reportCode: z.string().regex(/^[a-zA-Z0-9]+$/, 'Invalid report code'),
  season: z.string().optional().default('season-3'),
});

/**
 * Test endpoint for processing a single Warcraft Logs report
 *
 * Usage:
 * curl -X POST http://localhost:3000/api/test \
 *   -H "Content-Type: application/json" \
 *   -d '{"teamId":"test-team","reportCode":"ABC123","season":"season-3"}'
 */
export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const validatedInput = processReportSchema.safeParse(requestBody);

    if (!validatedInput.success) {
      return NextResponse.json(
        { error: validatedInput.error.issues[0].message },
        { status: 400 }
      );
    }

    const { teamId, reportCode, season } = validatedInput.data;

    // Process the report
    const result = await processReport(teamId, reportCode, season);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing report:', error);
    return NextResponse.json(
      {
        error: 'Failed to process report',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

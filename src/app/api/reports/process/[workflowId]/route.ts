import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { z } from 'zod';

const workflowIdSchema = z.string().uuid('Invalid workflow ID');

/**
 * GET /api/reports/process/:workflowId
 * Get the status of a report processing workflow
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const { workflowId } = await params;

    // Validate workflow ID
    const validation = workflowIdSchema.safeParse(workflowId);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const instance: WorkflowInstance = await env.WORKFLOWS.get(validation.data);

    if (!instance) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    const workflowStatus = await instance.status();

    return NextResponse.json({
      id: instance.id,
      status: workflowStatus.status,
      output: workflowStatus.output,
    });
  } catch (error) {
    console.error('Error fetching workflow status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow status' },
      { status: 500 }
    );
  }
}

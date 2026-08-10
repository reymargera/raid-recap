import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import { getDB } from '@/lib/db';
import { playerStats, teamStats, processingJobs } from '@/lib/db/schema';
import { WarcraftLogsClient } from '@/warcraft-logs/client';
import { ReportFight } from '@/__generated__/graphql';
import { PowerInfusion, TrackedDebuffs } from '@/app/_config/auras';
import { TeamStats } from '@/warcraft-logs/model/team-stats';
import { extractPlayerStatsFromLog, splitFightsForReport } from '@/app/teams/[id]/log-puller';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

interface ProcessReportParams {
  teamId: string;
  reportCode: string;
  season: string;
}

/**
 * Cloudflare Workflow for processing Warcraft Logs reports
 *
 * This workflow handles long-running report processing (14+ seconds)
 * with automatic retries, durable execution, and no timeout limits.
 *
 * Each step is independently retryable. If a step fails, the workflow
 * will retry from that step without restarting the entire process.
 */
export class ProcessReportWorkflow extends WorkflowEntrypoint<Env, ProcessReportParams> {
  async run(event: WorkflowEvent<ProcessReportParams>, step: WorkflowStep) {
    const { teamId, reportCode, season } = event.payload;

    // Step 1: Fetch report metadata from Warcraft Logs
    const reportMetadata = await step.do('fetch-metadata', async () => {
      const warcraftLogs = new WarcraftLogsClient();
      console.log(`[Workflow] Fetching metadata for report ${reportCode}`);

      const metadata = await warcraftLogs.getReportMetadata({ reportCode });

      if (!metadata || !metadata.fights) {
        throw new Error(`Report ${reportCode} not found or has no fights`);
      }

      console.log(`[Workflow] Found report ${reportCode} with ${metadata.fights.length} fights`);
      return metadata;
    });

    // Step 2: Validate and segment fights (CPU work)
    const fightResult = await step.do('validate-and-segment-fights', async () => {
      console.log(`[Workflow] Processing fights for report ${reportCode}`);

      const fights = reportMetadata.fights!.filter((f) => f != null) as ReportFight[];

      // Split into boss and trash fights
      const { bossFightIds, trashFightIds } = splitFightsForReport(fights);

      // Check if no boss fights - this is a valid skip scenario, not an error
      if (bossFightIds.length === 0) {
        console.log(`[Workflow] Skipping report ${reportCode} - no boss fights found`);
        return { skip: true };
      }

      // Calculate fight sequence ID for deduplication
      const fightSequence = fights
        .map((fight: any) => `${fight.encounterID}:${fight.startTime}:${fight.endTime}`)
        .sort()
        .join(',');
      const fightSequenceId = crypto.createHash('md5').update(fightSequence).digest('hex');

      console.log(`[Workflow] Found ${bossFightIds.length} boss fights, ${trashFightIds.length} trash fights`);
      console.log(`[Workflow] Fight sequence ID: ${fightSequenceId}`);

      return { skip: false, bossFightIds, trashFightIds, fightSequenceId };
    });

    // Early return if no boss fights
    if (fightResult.skip) {
      return {
        status: 'skipped' as const,
        reportCode,
      };
    }

    const { bossFightIds, trashFightIds, fightSequenceId } = fightResult;

    // Step 3: Check for duplicates and create processing job
    const jobResult = await step.do('check-and-create-job', async () => {
      const db = getDB(this.env.DB);

      // Check if already processed - this is a valid skip scenario, not an error
      const existingJob = await db.query.processingJobs.findFirst({
        where: eq(processingJobs.fightSequenceId, fightSequenceId),
      });

      if (existingJob && existingJob.status === 'completed') {
        console.log(`[Workflow] Report ${reportCode} already processed (job ${existingJob.id})`);
        return { deduped: true };
      }

      // Create new processing job
      const jobId = crypto.randomUUID();
      await db.insert(processingJobs).values({
        id: jobId,
        teamId,
        status: 'processing',
        versionNumber: 1,
        logCode: reportCode,
        fightSequenceId,
        error: null,
      });

      console.log(`[Workflow] Created processing job ${jobId}`);
      return { deduped: false, jobId };
    });

    // Early return if already processed
    if (jobResult.deduped) {
      return {
        status: 'deduped' as const,
        reportCode,
      };
    }

    const jobId = jobResult.jobId!;

    // Step 4: Fetch, extract, and save all stats (combined to avoid 1MB workflow state limit)
    await step.do('fetch-and-process-report-stats', async () => {
      const db = getDB(this.env.DB);
      const warcraftLogs = new WarcraftLogsClient();

      // Fetch detailed report data
      console.log(`[Workflow] Fetching detailed data for report ${reportCode}`);
      const reportData = await warcraftLogs.getReport({
        reportCode,
        bossFightIds,
        buffFilter: `type = "applybuff" AND ability.id IN (${PowerInfusion})`,
        debuffFilter: `type = "applydebuff" AND ability.id IN (${TrackedDebuffs.join(', ')})`,
      });

      // Extract and save player stats
      console.log(`[Workflow] Extracting player stats`);
      const playerStatsMap = extractPlayerStatsFromLog(reportData);

      const playerStatsInserts = Array.from(playerStatsMap.values()).map((playerStat) => {
        const stats = playerStat.getStats('Boss');

        return {
          id: crypto.randomUUID(),
          teamId,
          logCode: reportCode,
          playerId: playerStat.id,
          playerName: playerStat.name,
          server: playerStat.server,
          playerClass: playerStat.playerClass,
          spec: playerStat.spec,
          role: playerStat.role,
          season,
          stats: stats,
        };
      });

      if (playerStatsInserts.length > 0) {
        const insertStatements = playerStatsInserts.map(stat =>
          db.insert(playerStats).values(stat)
        );
        await db.batch(insertStatements  as [typeof insertStatements[0], ...typeof insertStatements[0][]]);
      }

      console.log(`[Workflow] Saved ${playerStatsInserts.length} player stats`);

      // Extract and save team stats
      console.log(`[Workflow] Extracting team stats`);
      const teamStatsObj = new TeamStats();
      teamStatsObj.addRaidNights([reportMetadata]);
      teamStatsObj.addReport(reportData);

      const teamStatsData = {
        id: crypto.randomUUID(),
        teamId,
        logCode: reportCode,
        season,
        stats: JSON.parse(teamStatsObj.toJson()),
      };

      await db.insert(teamStats).values(teamStatsData);
      console.log(`[Workflow] Saved team stats`);
    });

    // Step 5: Mark job as completed
    await step.do('mark-job-complete', async () => {
      const db = getDB(this.env.DB);

      await db.update(processingJobs)
        .set({
          status: 'completed',
          updatedAt: new Date(),
        })
        .where(eq(processingJobs.id, jobId));

      console.log(`[Workflow] Marked job ${jobId} as completed`);
    });

    // Return final summary
    return {
      status: 'processed' as const,
      reportCode,
      jobId,
    };
  }
}

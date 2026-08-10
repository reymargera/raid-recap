'use server';

import { getDB } from '@/lib/db';
import { teams, playerStats, teamStats, processingJobs } from '@/lib/db/schema';
import { WarcraftLogsClient } from '@/warcraft-logs/client';
import { ReportFight } from '@/__generated__/graphql';
import { DpsLossDebuffs, PowerInfusion, TrackedDebuffs } from '@/app/_config/auras';
import { TeamStats } from '@/warcraft-logs/model/team-stats';
import { PlayerStats } from '@/warcraft-logs/model/player-stats';
import { extractPlayerStatsFromLog, splitFightsForReport } from '@/app/teams/[id]/log-puller';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { TeamService } from '@/lib/services/team-service';
import { StatsService } from '@/lib/services/stats-service';

/**
 * Get the D1 database binding from the Cloudflare environment
 */
function getD1Database(): D1Database {
  const { env } = getCloudflareContext();
  return env.DB as D1Database;
}

/**
 * Process a single Warcraft Logs report for a team
 * @param teamId - The team ID
 * @param reportCode - The Warcraft Logs report code
 * @param season - The season identifier
 */
export async function processReport(
  teamId: string,
  reportCode: string,
  season: string = 'season-3'
) {
  const d1 = getD1Database();
  const db = getDB(d1);
  const warcraftLogs = new WarcraftLogsClient();

  // Step 1: Fetch report metadata to get fights
  const reportMetadata = await warcraftLogs.getReportMetadata({ reportCode });

  if (!reportMetadata || !reportMetadata.fights) {
    throw new Error(`Report ${reportCode} not found or has no fights`);
  }

  const fights = reportMetadata.fights.filter((f) => f != null) as ReportFight[];

  // Step 2: Split fights into boss fights and trash fights
  const { bossFightIds, trashFightIds } = splitFightsForReport(fights);

  // Skip if no boss fights
  if (bossFightIds.length === 0) {
    console.log(`Skipping report ${reportCode} - no boss fights found`);
    return {
      success: false,
      alreadyProcessed: false,
      reportCode,
      error: 'No boss fights found',
    };
  }

  // Step 3: Calculate fight sequence ID for deduplication
  const fightSequenceId = calculateFightSequenceId(fights);

  // Step 4: Check if this report has already been processed
  const existingJob = await db.query.processingJobs.findFirst({
    where: eq(processingJobs.fightSequenceId, fightSequenceId),
  });

  if (existingJob && existingJob.status === 'completed') {
    console.log(`Report ${reportCode} already processed, skipping`);
    return {
      success: true,
      alreadyProcessed: true,
      reportCode,
    };
  }

  // Step 5: Create processing job
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

  try {
    // Step 6: Fetch detailed report data with stats
    const reportData = await warcraftLogs.getReport({
      reportCode,
      bossFightIds,
      buffFilter: `type = "applybuff" AND ability.id IN (${PowerInfusion})`,
      debuffFilter: `type = "applydebuff" AND ability.id IN (${TrackedDebuffs.join(', ')})`,
    });

    // Step 7: Extract player stats using the shared function
    const playerStatsMap = extractPlayerStatsFromLog(reportData);

    // Step 8: Prepare player stats for insertion
    const playerStatsInserts = Array.from(playerStatsMap.values()).map((playerStat) => {
      // Get the Stats object from the PlayerStats instance
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
        stats: stats, // Drizzle handles JSON serialization with mode: 'json'
      };
    });

    // Step 9: Insert all player stats using batch to avoid D1 variable limit
    if (playerStatsInserts.length > 0) {
      const insertStatements = playerStatsInserts.map(stat =>
        db.insert(playerStats).values(stat)
      );

      // Batch
      await db.batch(insertStatements as [typeof insertStatements[0], ...typeof insertStatements[0][]]);
    }

    // Step 10: Extract and store team stats
    const teamStatsObj = new TeamStats();
    teamStatsObj.addRaidNights([reportMetadata]);
    teamStatsObj.addReport(reportData);

    const teamStatsData = {
      id: crypto.randomUUID(),
      teamId,
      logCode: reportCode,
      season,
      stats: JSON.parse(teamStatsObj.toJson()), // Parse string to object for Drizzle
    };

    await db.insert(teamStats).values(teamStatsData);

    // Step 11: Update job status to completed
    await db.update(processingJobs)
      .set({
        status: 'completed',
        updatedAt: new Date(),
      })
      .where(eq(processingJobs.id, jobId));

    return {
      success: true,
      alreadyProcessed: false,
      reportCode,
      jobId,
      playersProcessed: playerStatsInserts.length,
    };
  } catch (error) {
    // Update job status to failed
    await db.update(processingJobs)
      .set({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: new Date(),
      })
      .where(eq(processingJobs.id, jobId));

    throw error;
  }
}

/**
 * Calculate a unique fight sequence ID for deduplication
 */
function calculateFightSequenceId(fights: any[]): string {
  const fightSequence = fights
    .map((fight: any) => `${fight.encounterID}:${fight.startTime}:${fight.endTime}`)
    .sort()
    .join(',');

  return crypto.createHash('md5').update(fightSequence).digest('hex');
}

/**
 * Get aggregated stats for a team with attendance filtering applied
 */
export async function getTeamStats(teamId: string) {
  const teamService = new TeamService();
  const statsService = new StatsService();

  // Get team
  const team = await teamService.getTeamById(teamId);

  if (!team) {
    throw new Error(`Team not found: ${teamId}`);
  }

  // Get filtered stats based on team attendance config
  const stats = await statsService.getFilteredStats(teamId, {
    attendancePercent: team.attendancePercent,
    attendanceIncludeIds: team.attendanceIncludeIds ?? [],
    attendanceExcludeIds: team.attendanceExcludeIds ?? [],
  });

  return {
    team,
    ...stats,
  };
}

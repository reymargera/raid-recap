import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB, type DB } from '@/lib/db';
import { playerStats, teamStats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PlayerStats } from '@/warcraft-logs/model/player-stats';
import { TeamStats } from '@/warcraft-logs/model/team-stats';

/**
 * Stats Service
 * Handles aggregation of player and team statistics
 */
export class StatsService {
  private db: DB;

  constructor() {
    const { env } = getCloudflareContext();
    this.db = getDB(env.DB);
  }

  /**
   * Get aggregated stats for a team
   * Returns aggregated player stats and team stats
   */
  async getAggregatedStats(teamId: string) {
    // Get all player stats for this team
    const allPlayerStats = await this.db.query.playerStats.findMany({
      where: eq(playerStats.teamId, teamId),
    });

    // Get all team stats for this team
    const allTeamStats = await this.db.query.teamStats.findMany({
      where: eq(teamStats.teamId, teamId),
    });

    // Aggregate player stats by player ID
    const playerStatsMap = new Map<number, PlayerStats>();

    for (const dbPlayerStat of allPlayerStats) {
      const playerId = dbPlayerStat.playerId;

      // Get or create PlayerStats instance for this player
      if (!playerStatsMap.has(playerId)) {
        // Create new PlayerStats instance
        const playerStatsInstance = new PlayerStats({
          id: dbPlayerStat.playerId,
          name: dbPlayerStat.playerName,
          server: dbPlayerStat.server,
          playerClass: dbPlayerStat.playerClass,
          spec: dbPlayerStat.spec,
          role: dbPlayerStat.role,
        });

        // Add the stats from this log
        playerStatsInstance.addStats('Boss', dbPlayerStat.stats as any);
        playerStatsMap.set(playerId, playerStatsInstance);
      } else {
        // Merge stats into existing PlayerStats
        const existingPlayerStats = playerStatsMap.get(playerId)!;
        existingPlayerStats.addStats('Boss', dbPlayerStat.stats as any);
      }
    }

    // Aggregate team stats
    let aggregatedTeamStats: TeamStats | null = null;

    if (allTeamStats.length > 0) {
      // Create first TeamStats instance from JSON
      aggregatedTeamStats = TeamStats.fromJson(JSON.stringify(allTeamStats[0].stats));

      // Merge remaining team stats
      for (let i = 1; i < allTeamStats.length; i++) {
        const teamStatToMerge = TeamStats.fromJson(JSON.stringify(allTeamStats[i].stats));
        aggregatedTeamStats.merge(teamStatToMerge);
      }
    }

    // Convert aggregated player stats to array of JSON strings (format expected by UI)
    const aggregatedPlayerStatsJson = Array.from(playerStatsMap.values()).map((ps) => ps.toJson());

    return {
      playerStats: aggregatedPlayerStatsJson,
      teamStats: aggregatedTeamStats ? aggregatedTeamStats.toJson() : null,
    };
  }
}

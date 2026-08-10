import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB, type DB } from '@/lib/db';
import { teams, playerStats } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { CURRENT_SEASON } from '@/app/_config/season';

/**
 * Team Service
 * Handles team CRUD operations
 */
export class TeamService {
  private db: DB;

  constructor() {
    const { env } = getCloudflareContext();
    this.db = getDB(env.DB);
  }

  /**
   * Get team by ID
   */
  async getTeamById(teamId: string) {
    return await this.db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });
  }

  /**
   * Update team metadata
   */
  async updateTeam(teamId: string, data: {
    name?: string;
    attendancePercent?: number;
    attendanceIncludeIds?: number[];
    attendanceExcludeIds?: number[];
  }) {
    await this.db
      .update(teams)
      .set({
        ...data,
        lastUpdated: new Date(),
      })
      .where(eq(teams.id, teamId));

    return this.getTeamById(teamId);
  }

  /**
   * Delete team
   */
  async deleteTeam(teamId: string) {
    await this.db.delete(teams).where(eq(teams.id, teamId));
  }

  /**
   * Get unique players from playerStats for a team, scoped to the current season
   * Returns player id, name, server, class, and appearance count
   */
  async getUniquePlayersForTeam(teamId: string) {
    const allPlayerStats = await this.db.query.playerStats.findMany({
      where: and(eq(playerStats.teamId, teamId), eq(playerStats.season, CURRENT_SEASON)),
    });

    // Group by playerId and count appearances
    const playerMap = new Map<number, {
      playerId: number;
      playerName: string;
      server: string;
      playerClass: string;
      appearances: number;
    }>();

    for (const stat of allPlayerStats) {
      const existing = playerMap.get(stat.playerId);
      if (existing) {
        existing.appearances++;
        // Keep most recent name/server/class
        existing.playerName = stat.playerName;
        existing.server = stat.server;
        existing.playerClass = stat.playerClass;
      } else {
        playerMap.set(stat.playerId, {
          playerId: stat.playerId,
          playerName: stat.playerName,
          server: stat.server,
          playerClass: stat.playerClass,
          appearances: 1,
        });
      }
    }

    return Array.from(playerMap.values());
  }
}

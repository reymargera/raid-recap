import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDB, type DB } from '@/lib/db';
import { teams } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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
   * TODO: Implement when authentication is added
   */
  async updateTeam(teamId: string, data: { name?: string }) {
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
   * TODO: Implement when authentication is added
   */
  async deleteTeam(teamId: string) {
    await this.db.delete(teams).where(eq(teams.id, teamId));
  }
}

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createAuth } from './auth';
import { getDB } from './db';
import { teamAdmins } from './db/schema';
import { users } from './db/auth-schema';
import { eq, and } from 'drizzle-orm';

interface AuthResult {
  authenticated: boolean;
  userId?: string;
  isSuperAdmin?: boolean;
}

/**
 * Get the current session from a request
 */
export async function getSession(request: Request): Promise<AuthResult> {
  try {
    const { env } = getCloudflareContext();
    const auth = createAuth(env);

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      userId: session.user.id,
      isSuperAdmin: session.user.isSuperAdmin ?? false,
    };
  } catch {
    return { authenticated: false };
  }
}

/**
 * Check if a user can process logs for a specific team
 * Returns true if:
 * - User is a super admin, OR
 * - User is a team admin for the specified team
 */
export async function canProcessLogs(userId: string, teamId: string): Promise<boolean> {
  const { env } = getCloudflareContext();
  const db = getDB(env.DB);

  // Check if user is super admin
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (user?.isSuperAdmin) {
    return true;
  }

  // Check if user is team admin for this specific team
  const teamAdmin = await db
    .select()
    .from(teamAdmins)
    .where(and(eq(teamAdmins.userId, userId), eq(teamAdmins.teamId, teamId)))
    .get();

  return !!teamAdmin;
}

/**
 * Authorize a request for processing logs
 * Checks both OAuth session and API key fallback
 */
export async function authorizeProcessLogs(
  request: Request,
  teamId: string
): Promise<{ authorized: boolean; method: 'oauth' | 'api-key' | null; userId?: string }> {
  const { env } = getCloudflareContext();

  // First, try API key auth (for CLI/automation)
  const apiKey = request.headers.get('X-API-Key');
  if (apiKey && apiKey === env.ADMIN_API_KEY) {
    return { authorized: true, method: 'api-key' };
  }

  // Then, try OAuth session
  const session = await getSession(request);
  if (!session.authenticated || !session.userId) {
    return { authorized: false, method: null };
  }

  // Check if user can process logs for this team
  const canProcess = await canProcessLogs(session.userId, teamId);
  if (canProcess) {
    return { authorized: true, method: 'oauth', userId: session.userId };
  }

  return { authorized: false, method: null };
}

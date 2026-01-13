/**
 * Cloudflare environment bindings
 * These types define the bindings available in the Cloudflare Workers environment
 */
interface Env {
  // D1 Database binding
  DB: D1Database;

  // Workflows binding
  WORKFLOWS: Workflow;

  // Secrets
  WARCRAFTLOGS_TOKEN: string;
  ADMIN_API_KEY: string;

  // Battle.net OAuth credentials (set via wrangler secret)
  BATTLENET_CLIENT_ID: string;
  BATTLENET_CLIENT_SECRET: string;
}

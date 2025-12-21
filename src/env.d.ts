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
}

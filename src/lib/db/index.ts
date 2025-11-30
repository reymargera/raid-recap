import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

/**
 * Creates a Drizzle database client from a D1Database instance
 * @param d1 - The D1Database binding from Cloudflare Workers
 * @returns Drizzle database client with schema
 */
export function getDB(d1: D1Database) {
  return drizzle(d1, { schema });
}

/**
 * Type helper for the database client
 */
export type DB = ReturnType<typeof getDB>;

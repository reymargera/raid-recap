import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import * as authSchema from './auth-schema';

// Combine schemas for Drizzle
const combinedSchema = { ...schema, ...authSchema };

/**
 * Creates a Drizzle database client from a D1Database instance
 * @param d1 - The D1Database binding from Cloudflare Workers
 * @returns Drizzle database client with schema
 */
export function getDB(d1: D1Database) {
  return drizzle(d1, { schema: combinedSchema });
}

/**
 * Type helper for the database client
 */
export type DB = ReturnType<typeof getDB>;

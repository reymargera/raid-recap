import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { z } from 'zod';

// Teams table - stores team metadata
export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  guildId: integer('guildId').notNull(),
  lastUpdatedBy: text('lastUpdatedBy'), // For future auth - nullable for now
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  lastUpdated: integer('lastUpdated', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Player stats table - one row per player per log upload
export const playerStats = sqliteTable('playerStats', {
  id: text('id').primaryKey(),
  teamId: text('teamId').notNull().references(() => teams.id),
  logCode: text('logCode').notNull(),
  playerId: integer('playerId').notNull(),
  playerName: text('playerName').notNull(),
  server: text('server').notNull(),
  season: text('season').notNull(),
  stats: text('stats', { mode: 'json' }).notNull(), // JSON object with all player stats
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Team stats table - one row per log upload
export const teamStats = sqliteTable('teamStats', {
  id: text('id').primaryKey(),
  teamId: text('teamId').notNull().references(() => teams.id),
  logCode: text('logCode').notNull(),
  season: text('season').notNull(),
  stats: text('stats', { mode: 'json' }).notNull(), // JSON object with all team stats
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Processing jobs table - tracks log processing status
export const processingJobs = sqliteTable('processingJobs', {
  id: text('id').primaryKey(),
  teamId: text('teamId').notNull().references(() => teams.id),
  status: text('status', { enum: ['queued', 'processing', 'completed', 'failed'] }).notNull(),
  versionNumber: integer('versionNumber').notNull(), // Schema/processing version
  logCode: text('logCode').notNull(), // Warcraft Logs report ID
  fightSequenceId: text('fightSequenceId').notNull(), // For deduplication
  error: text('error'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Zod validators for runtime type checking
export const insertTeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  guildId: z.number(),
  lastUpdatedBy: z.string().optional(),
});

export const insertPlayerStatsSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  logCode: z.string(),
  playerId: z.number(),
  playerName: z.string(),
  server: z.string(),
  season: z.string(),
  stats: z.record(z.any()), // JSON object
});

export const insertTeamStatsSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  logCode: z.string(),
  season: z.string(),
  stats: z.record(z.any()), // JSON object
});

export const insertProcessingJobSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
  versionNumber: z.number(),
  logCode: z.string(),
  fightSequenceId: z.string(),
  error: z.string().optional(),
});

// TypeScript types inferred from schema
export type Team = typeof teams.$inferSelect;
export type NewTeam = z.infer<typeof insertTeamSchema>;

export type PlayerStats = typeof playerStats.$inferSelect;
export type NewPlayerStats = z.infer<typeof insertPlayerStatsSchema>;

export type TeamStats = typeof teamStats.$inferSelect;
export type NewTeamStats = z.infer<typeof insertTeamStatsSchema>;

export type ProcessingJob = typeof processingJobs.$inferSelect;
export type NewProcessingJob = z.infer<typeof insertProcessingJobSchema>;

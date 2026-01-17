import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { users } from './auth-schema';

// Teams table - stores team metadata
export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  guildId: integer('guildId').notNull(),
  lastUpdatedBy: text('lastUpdatedBy'), // For future auth - nullable for now
  attendancePercent: real('attendancePercent').notNull().default(0.2),
  attendanceIncludeIds: text('attendanceIncludeIds', { mode: 'json' }).$type<number[]>().default([]),
  attendanceExcludeIds: text('attendanceExcludeIds', { mode: 'json' }).$type<number[]>().default([]),
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
  playerClass: text('playerClass').notNull(),
  spec: text('spec').notNull(),
  role: text('role').notNull(),
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

// Team admins join table - links users to teams they can admin
// References 'user' table from auth-schema.ts (managed by Better Auth)
export const teamAdmins = sqliteTable('teamAdmins', {
  id: text('id').primaryKey(),
  teamId: text('teamId').notNull().references(() => teams.id),
  userId: text('userId').notNull().references(() => users.id),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Team highlights table - stores YouTube video highlights submitted by users
export const teamHighlights = sqliteTable('teamHighlights', {
  id: text('id').primaryKey(),
  teamId: text('teamId').notNull().references(() => teams.id),
  submittedBy: text('submittedBy').notNull().references(() => users.id),
  encounterName: text('encounterName').notNull(),
  title: text('title').notNull(),
  videoUrl: text('videoUrl').notNull(),
  description: text('description'),
  date: text('date'), // ISO format: YYYY-MM-DD
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Zod validators for runtime type checking
export const insertTeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  guildId: z.number(),
  lastUpdatedBy: z.string().optional(),
  attendancePercent: z.number().optional(),
  attendanceIncludeIds: z.array(z.number()).optional(),
  attendanceExcludeIds: z.array(z.number()).optional(),
});

export const insertPlayerStatsSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  logCode: z.string(),
  playerId: z.number(),
  playerName: z.string(),
  server: z.string(),
  playerClass: z.string(),
  spec: z.string(),
  role: z.string(),
  season: z.string(),
  stats: z.record(z.string(), z.any()), // JSON object
});

export const insertTeamStatsSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  logCode: z.string(),
  season: z.string(),
  stats: z.record(z.string(), z.any()), // JSON object
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

export const insertTeamAdminSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  userId: z.string(),
});

export type TeamAdmin = typeof teamAdmins.$inferSelect;
export type NewTeamAdmin = z.infer<typeof insertTeamAdminSchema>;

export const insertTeamHighlightSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  submittedBy: z.string(),
  encounterName: z.string().min(1),
  title: z.string().min(1).max(100),
  videoUrl: z.string().url(),
  description: z.string().max(500).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type TeamHighlight = typeof teamHighlights.$inferSelect;
export type NewTeamHighlight = z.infer<typeof insertTeamHighlightSchema>;

// Re-export user types from auth-schema for convenience
export type { users } from './auth-schema';

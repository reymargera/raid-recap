CREATE TABLE `playerStats` (
	`id` text PRIMARY KEY NOT NULL,
	`teamId` text NOT NULL,
	`logCode` text NOT NULL,
	`playerId` integer NOT NULL,
	`playerName` text NOT NULL,
	`server` text NOT NULL,
	`playerClass` text NOT NULL,
	`spec` text NOT NULL,
	`role` text NOT NULL,
	`season` text NOT NULL,
	`stats` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `processingJobs` (
	`id` text PRIMARY KEY NOT NULL,
	`teamId` text NOT NULL,
	`status` text NOT NULL,
	`versionNumber` integer NOT NULL,
	`logCode` text NOT NULL,
	`fightSequenceId` text NOT NULL,
	`error` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `teamStats` (
	`id` text PRIMARY KEY NOT NULL,
	`teamId` text NOT NULL,
	`logCode` text NOT NULL,
	`season` text NOT NULL,
	`stats` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`guildId` integer NOT NULL,
	`lastUpdatedBy` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`lastUpdated` integer DEFAULT (unixepoch()) NOT NULL
);

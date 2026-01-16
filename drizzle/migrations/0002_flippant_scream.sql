ALTER TABLE `teams` ADD `attendancePercent` real DEFAULT 0.2 NOT NULL;--> statement-breakpoint
ALTER TABLE `teams` ADD `attendanceIncludeIds` text DEFAULT '[]';--> statement-breakpoint
ALTER TABLE `teams` ADD `attendanceExcludeIds` text DEFAULT '[]';
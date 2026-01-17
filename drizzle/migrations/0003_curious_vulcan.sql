CREATE TABLE `teamHighlights` (
	`id` text PRIMARY KEY NOT NULL,
	`teamId` text NOT NULL,
	`submittedBy` text NOT NULL,
	`encounterName` text NOT NULL,
	`title` text NOT NULL,
	`videoUrl` text NOT NULL,
	`description` text,
	`date` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`submittedBy`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

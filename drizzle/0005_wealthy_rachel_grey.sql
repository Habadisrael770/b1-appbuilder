CREATE TABLE `builds` (
	`id` varchar(64) NOT NULL,
	`appId` int NOT NULL,
	`userId` int NOT NULL,
	`platform` enum('IOS','ANDROID','BOTH') NOT NULL,
	`status` enum('PENDING','RUNNING','BUILDING','COMPLETED','FAILED') NOT NULL DEFAULT 'PENDING',
	`progress` int NOT NULL DEFAULT 0,
	`retries` int NOT NULL DEFAULT 0,
	`maxRetries` int NOT NULL DEFAULT 1,
	`githubRunId` varchar(255),
	`githubRunIdIos` varchar(255),
	`androidUrl` text,
	`iosUrl` text,
	`error` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `builds_id` PRIMARY KEY(`id`)
);

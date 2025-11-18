CREATE TABLE `apps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`appName` varchar(255) NOT NULL,
	`websiteUrl` varchar(2048) NOT NULL,
	`platform` enum('IOS','ANDROID','BOTH') NOT NULL DEFAULT 'BOTH',
	`iconUrl` text,
	`splashScreenUrl` text,
	`primaryColor` varchar(7) NOT NULL DEFAULT '#00A86B',
	`secondaryColor` varchar(7),
	`status` enum('PROCESSING','COMPLETED','FAILED') NOT NULL DEFAULT 'PROCESSING',
	`iosPackageUrl` text,
	`androidPackageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `apps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripePaymentId` varchar(255),
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`status` enum('SUCCEEDED','PENDING','FAILED') NOT NULL,
	`paymentMethod` varchar(50) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_stripePaymentId_unique` UNIQUE(`stripePaymentId`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeSubscriptionId` varchar(255),
	`plan` enum('FREE','BASIC','PRO','ENTERPRISE') NOT NULL DEFAULT 'FREE',
	`status` varchar(50) NOT NULL,
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelAtPeriodEnd` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_stripeSubscriptionId_unique` UNIQUE(`stripeSubscriptionId`)
);

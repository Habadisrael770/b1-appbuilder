ALTER TABLE `users` ADD `trialEndsAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `isTrialActive` int DEFAULT 1 NOT NULL;
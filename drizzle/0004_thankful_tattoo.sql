ALTER TABLE `payments` MODIFY COLUMN `paymentMethod` varchar(50);--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `hasPaymentMethod` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `defaultPaymentMethodId` varchar(255);
CREATE TABLE `academy_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`enrollment_id` text NOT NULL,
	`user_id` text NOT NULL,
	`lesson_id` text,
	`kind` text NOT NULL,
	`title` text,
	`payload` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `academy_submissions_enr_idx` ON `academy_submissions` (`enrollment_id`,`kind`);--> statement-breakpoint
CREATE UNIQUE INDEX `academy_submissions_enr_kind_uq` ON `academy_submissions` (`enrollment_id`,`kind`,`lesson_id`);--> statement-breakpoint
CREATE TABLE `entitlements` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`key` text NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`source` text DEFAULT 'PURCHASE' NOT NULL,
	`order_id` text,
	`note` text,
	`created_at` integer NOT NULL,
	`revoked_at` integer,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `entitlements_user_key_uq` ON `entitlements` (`user_id`,`key`);--> statement-breakpoint
CREATE INDEX `entitlements_status_idx` ON `entitlements` (`key`,`status`);--> statement-breakpoint
CREATE TABLE `video_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text,
	`module_id` text,
	`title` text NOT NULL,
	`slug` text,
	`description` text,
	`status` text DEFAULT 'SCRIPTED' NOT NULL,
	`duration_sec` integer NOT NULL,
	`playback_url` text,
	`storage_key` text,
	`thumbnail_url` text,
	`script` text,
	`storyboard` text NOT NULL,
	`chapters` text NOT NULL,
	`subtitles_url` text,
	`transcript` text,
	`brand` text DEFAULT 'nuvra-dark-blue' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`module_id`) REFERENCES `course_modules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `video_assets_lesson_uq` ON `video_assets` (`lesson_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `video_assets_module_uq` ON `video_assets` (`module_id`);--> statement-breakpoint
CREATE INDEX `video_assets_status_idx` ON `video_assets` (`status`);--> statement-breakpoint
CREATE TABLE `video_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`enrollment_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`position_sec` integer NOT NULL,
	`duration_sec` integer NOT NULL,
	`percent` integer NOT NULL,
	`completed_at` integer,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `video_progress_enr_lesson_uq` ON `video_progress` (`enrollment_id`,`lesson_id`);--> statement-breakpoint
ALTER TABLE `course_modules` ADD `slug` text;--> statement-breakpoint
ALTER TABLE `course_modules` ADD `description` text;--> statement-breakpoint
ALTER TABLE `course_modules` ADD `objectives` text NOT NULL DEFAULT '[]';--> statement-breakpoint
ALTER TABLE `course_modules` ADD `cover_url` text;--> statement-breakpoint
ALTER TABLE `course_modules` ADD `published` integer NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `course_modules` ADD `updated_at` integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE `course_modules` SET `updated_at` = `created_at` WHERE `updated_at` = 0;--> statement-breakpoint
CREATE UNIQUE INDEX `course_modules_course_slug_uq` ON `course_modules` (`course_id`,`slug`);--> statement-breakpoint
ALTER TABLE `lessons` ADD `slug` text;--> statement-breakpoint
ALTER TABLE `lessons` ADD `short_description` text;--> statement-breakpoint
ALTER TABLE `lessons` ADD `objectives` text NOT NULL DEFAULT '[]';--> statement-breakpoint
ALTER TABLE `lessons` ADD `resources` text NOT NULL DEFAULT '[]';--> statement-breakpoint
ALTER TABLE `lessons` ADD `exercise` text;--> statement-breakpoint
ALTER TABLE `lessons` ADD `nuvra_action` text;--> statement-breakpoint
ALTER TABLE `lessons` ADD `completion_criteria` text NOT NULL DEFAULT '[]';--> statement-breakpoint
ALTER TABLE `lessons` ADD `difficulty` text DEFAULT 'beginner' NOT NULL;--> statement-breakpoint
ALTER TABLE `lessons` ADD `duration_sec` integer NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `lessons` ADD `published` integer NOT NULL DEFAULT 1;--> statement-breakpoint
CREATE INDEX `lessons_module_idx` ON `lessons` (`module_id`,`position`);--> statement-breakpoint
CREATE UNIQUE INDEX `lessons_course_slug_uq` ON `lessons` (`course_id`,`slug`);
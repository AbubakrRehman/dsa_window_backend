-- DropForeignKey
ALTER TABLE `questions_events` DROP FOREIGN KEY `questions_events_userId_fkey`;

-- AddForeignKey
ALTER TABLE `questions_events` ADD CONSTRAINT `questions_events_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

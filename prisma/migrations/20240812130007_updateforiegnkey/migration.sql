-- DropForeignKey
ALTER TABLE `questions_events` DROP FOREIGN KEY `questions_events_questionId_fkey`;

-- AddForeignKey
ALTER TABLE `questions_events` ADD CONSTRAINT `questions_events_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

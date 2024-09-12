-- DropForeignKey
ALTER TABLE `profile_pics` DROP FOREIGN KEY `profile_pics_userId_fkey`;

-- AddForeignKey
ALTER TABLE `profile_pics` ADD CONSTRAINT `profile_pics_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

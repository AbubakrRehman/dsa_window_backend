-- CreateTable
CREATE TABLE `profile_pics` (
    `id` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `profile_pics_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `profile_pics` ADD CONSTRAINT `profile_pics_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

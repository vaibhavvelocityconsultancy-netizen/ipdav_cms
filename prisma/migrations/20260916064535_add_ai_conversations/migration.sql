-- DropIndex
DROP INDEX `EmailLog_status_idx` ON `emaillog`;

-- DropIndex
DROP INDEX `EmailLog_triggerEvent_idx` ON `emaillog`;

-- CreateTable
CREATE TABLE `AIConversation` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `tenantId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'New conversation',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AIConversation_tenantId_updatedAt_idx`(`tenantId`, `updatedAt`),
    INDEX `AIConversation_userId_updatedAt_idx`(`userId`, `updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIMessage` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AIMessage_conversationId_createdAt_idx`(`conversationId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AIConversation` ADD CONSTRAINT `AIConversation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AIConversation` ADD CONSTRAINT `AIConversation_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AIMessage` ADD CONSTRAINT `AIMessage_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `AIConversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

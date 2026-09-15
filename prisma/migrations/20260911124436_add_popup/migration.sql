-- CreateTable
CREATE TABLE `Accordion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenantId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'ACTIVE', 'DISABLED') NOT NULL DEFAULT 'DRAFT',
    `css` LONGTEXT NOT NULL,
    `settings` JSON NULL,
    `icons` JSON NULL,
    `wrapperClass` VARCHAR(191) NULL,
    `itemClass` VARCHAR(191) NULL,
    `questionClass` VARCHAR(191) NULL,
    `answerClass` VARCHAR(191) NULL,
    `iconClass` VARCHAR(191) NULL,
    `pageId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Accordion_identifier_key`(`identifier`),
    INDEX `Accordion_tenantId_status_idx`(`tenantId`, `status`),
    INDEX `Accordion_tenantId_updatedAt_idx`(`tenantId`, `updatedAt`),
    INDEX `Accordion_pageId_idx`(`pageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccordionItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accordionId` INTEGER NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `answer` LONGTEXT NOT NULL,
    `customClass` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AccordionItem_accordionId_sortOrder_idx`(`accordionId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Accordion` ADD CONSTRAINT `Accordion_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Accordion` ADD CONSTRAINT `Accordion_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `page`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccordionItem` ADD CONSTRAINT `AccordionItem_accordionId_fkey` FOREIGN KEY (`accordionId`) REFERENCES `Accordion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

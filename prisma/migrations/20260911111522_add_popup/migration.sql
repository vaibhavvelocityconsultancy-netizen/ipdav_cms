-- CreateTable
CREATE TABLE `Popup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenantId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('MODAL', 'BAR', 'ELEMENT') NOT NULL DEFAULT 'MODAL',
    `target` ENUM('GLOBAL', 'SPECIFIC_PAGES') NOT NULL DEFAULT 'GLOBAL',
    `pageIds` JSON NULL,
    `trigger` ENUM('PAGE_LOAD', 'DELAY', 'ELEMENT_CLICK') NOT NULL DEFAULT 'PAGE_LOAD',
    `delayMs` INTEGER NOT NULL DEFAULT 0,
    `frequency` ENUM('EVERY_TIME', 'ONCE_SESSION', 'ONCE_DAY', 'ONCE_WEEK') NOT NULL DEFAULT 'EVERY_TIME',
    `status` ENUM('DRAFT', 'ACTIVE', 'PAUSED') NOT NULL DEFAULT 'DRAFT',
    `html` LONGTEXT NOT NULL,
    `css` LONGTEXT NULL,
    `elementClass` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Popup_elementClass_key`(`elementClass`),
    INDEX `Popup_tenantId_status_idx`(`tenantId`, `status`),
    INDEX `Popup_tenantId_updatedAt_idx`(`tenantId`, `updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Popup` ADD CONSTRAINT `Popup_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

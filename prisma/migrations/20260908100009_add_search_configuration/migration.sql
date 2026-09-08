/*
  Warnings:

  - You are about to drop the column `formId` on the `pricingpagesettings` table. All the data in the column will be lost.
  - You are about to drop the `form` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `formsubmission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `form` DROP FOREIGN KEY `form_tenantId_fkey`;

-- DropForeignKey
ALTER TABLE `formsubmission` DROP FOREIGN KEY `formsubmission_formId_fkey`;

-- DropForeignKey
ALTER TABLE `pricingpagesettings` DROP FOREIGN KEY `pricingPageSettings_formId_fkey`;

-- DropIndex
DROP INDEX `pricingPageSettings_formId_fkey` ON `pricingpagesettings`;

-- AlterTable
ALTER TABLE `pricingpagesettings` DROP COLUMN `formId`;

-- DropTable
DROP TABLE `form`;

-- DropTable
DROP TABLE `formsubmission`;

-- CreateTable
CREATE TABLE `SearchConfiguration` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `placeholder` VARCHAR(191) NOT NULL DEFAULT 'Search...',
    `buttonText` VARCHAR(191) NOT NULL DEFAULT 'Search',
    `searchPages` BOOLEAN NOT NULL DEFAULT true,
    `searchPosts` BOOLEAN NOT NULL DEFAULT true,
    `resultsPerPage` INTEGER NOT NULL DEFAULT 10,
    `noResultsMessage` VARCHAR(191) NOT NULL DEFAULT 'No results found.',
    `customClass` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `tenantId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SearchConfiguration_tenantId_idx`(`tenantId`),
    INDEX `SearchConfiguration_tenantId_isActive_idx`(`tenantId`, `isActive`),
    UNIQUE INDEX `SearchConfiguration_tenantId_slug_key`(`tenantId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SearchSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenantId` INTEGER NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `searchPages` BOOLEAN NOT NULL DEFAULT true,
    `searchPosts` BOOLEAN NOT NULL DEFAULT true,
    `placeholder` VARCHAR(191) NOT NULL DEFAULT 'Search...',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SearchSettings_tenantId_key`(`tenantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SearchConfiguration` ADD CONSTRAINT `SearchConfiguration_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SearchSettings` ADD CONSTRAINT `SearchSettings_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

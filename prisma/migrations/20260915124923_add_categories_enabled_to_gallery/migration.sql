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
ALTER TABLE `gallery` ADD COLUMN `categoriesEnabled` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `galleryimage` ADD COLUMN `category` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `pricingpagesettings` DROP COLUMN `formId`;

-- DropTable
DROP TABLE `form`;

-- DropTable
DROP TABLE `formsubmission`;

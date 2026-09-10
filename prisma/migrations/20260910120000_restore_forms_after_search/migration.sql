-- Restore forms tables removed by the search configuration migration while the forms module remains installed.
ALTER TABLE `pricingpagesettings` ADD COLUMN `formId` INTEGER NULL;

CREATE TABLE `form` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `fields` JSON NOT NULL,
    `submitButtonLabel` VARCHAR(191) NULL DEFAULT 'Submit',
    `submitButtonClass` VARCHAR(191) NULL,
    `confirmationType` VARCHAR(191) NOT NULL DEFAULT 'message',
    `confirmationMessage` TEXT NULL,
    `confirmationMessageClass` VARCHAR(191) NULL,
    `redirectUrl` VARCHAR(191) NULL,
    `emails` JSON NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `hideRequiredIndicator` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `layout` VARCHAR(191) NOT NULL DEFAULT 'default',
    `twoColumnHeading` TEXT NULL,
    `twoColumnParagraph` TEXT NULL,
    `tenantId` INTEGER NOT NULL,
    INDEX `form_tenantId_idx`(`tenantId`),
    UNIQUE INDEX `form_tenantId_slug_key`(`tenantId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `formsubmission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `formId` INTEGER NOT NULL,
    `data` JSON NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `read` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    INDEX `formsubmission_formId_idx`(`formId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `pricingpagesettings`
  ADD CONSTRAINT `pricingPageSettings_formId_fkey`
  FOREIGN KEY (`formId`) REFERENCES `form`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `form`
  ADD CONSTRAINT `form_tenantId_fkey`
  FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `formsubmission`
  ADD CONSTRAINT `formsubmission_formId_fkey`
  FOREIGN KEY (`formId`) REFERENCES `form`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

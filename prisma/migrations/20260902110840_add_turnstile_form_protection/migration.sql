-- AlterTable
ALTER TABLE `sitesettings` ADD COLUMN `turnstileEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `turnstileMode` VARCHAR(191) NOT NULL DEFAULT 'managed',
    ADD COLUMN `turnstileSecretKey` VARCHAR(191) NULL,
    ADD COLUMN `turnstileSiteKey` VARCHAR(191) NULL;

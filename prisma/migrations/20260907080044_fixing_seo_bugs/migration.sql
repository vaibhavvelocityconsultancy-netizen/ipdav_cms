-- CreateTable
CREATE TABLE `BreadcrumbSettings` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` INTEGER NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `homeLabel` VARCHAR(191) NOT NULL DEFAULT 'Home',
    `homeUrl` VARCHAR(191) NULL,
    `separator` VARCHAR(191) NOT NULL DEFAULT '/',
    `showHome` BOOLEAN NOT NULL DEFAULT true,
    `showCurrent` BOOLEAN NOT NULL DEFAULT true,
    `showParent` BOOLEAN NOT NULL DEFAULT true,
    `pagesEnabled` BOOLEAN NOT NULL DEFAULT true,
    `postsEnabled` BOOLEAN NOT NULL DEFAULT true,
    `categoriesEnabled` BOOLEAN NOT NULL DEFAULT true,
    `tagsEnabled` BOOLEAN NOT NULL DEFAULT true,
    `hideOnHome` BOOLEAN NOT NULL DEFAULT true,
    `hideOn404` BOOLEAN NOT NULL DEFAULT true,
    `hideOnSearch` BOOLEAN NOT NULL DEFAULT false,
    `schemaEnabled` BOOLEAN NOT NULL DEFAULT true,
    `cssClass` VARCHAR(191) NULL,
    `customCss` TEXT NULL,
    `linkColor` VARCHAR(191) NOT NULL DEFAULT '#4b5563',
    `linkHoverColor` VARCHAR(191) NOT NULL DEFAULT '#111827',
    `currentColor` VARCHAR(191) NOT NULL DEFAULT '#6b7280',
    `separatorColor` VARCHAR(191) NOT NULL DEFAULT '#9ca3af',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BreadcrumbSettings_tenantId_key`(`tenantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Redirect` (
    `id` VARCHAR(191) NOT NULL,
    `sourceUrl` VARCHAR(191) NOT NULL,
    `destinationUrl` VARCHAR(191) NOT NULL,
    `statusCode` INTEGER NOT NULL DEFAULT 301,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NULL,
    `isAutoDetected` BOOLEAN NOT NULL DEFAULT false,
    `hitCount` INTEGER NOT NULL DEFAULT 0,
    `lastUsedAt` DATETIME(3) NULL,
    `tenantId` INTEGER NOT NULL,

    UNIQUE INDEX `Redirect_sourceUrl_key`(`sourceUrl`),
    INDEX `Redirect_sourceUrl_idx`(`sourceUrl`),
    INDEX `Redirect_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotFoundLog` (
    `id` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `referrer` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `suggestedUrl` VARCHAR(191) NULL,
    `redirectId` VARCHAR(191) NULL,
    `isResolved` BOOLEAN NOT NULL DEFAULT false,
    `occurredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tenantId` INTEGER NOT NULL,

    INDEX `NotFoundLog_path_idx`(`path`),
    INDEX `NotFoundLog_isResolved_idx`(`isResolved`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RedirectImport` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `totalCount` INTEGER NOT NULL,
    `successCount` INTEGER NOT NULL,
    `failureCount` INTEGER NOT NULL,
    `errors` VARCHAR(191) NULL,
    `importedBy` VARCHAR(191) NOT NULL,
    `importedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tenantId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InternalLinkRule` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` INTEGER NOT NULL,
    `keyword` VARCHAR(191) NOT NULL,
    `destinationType` VARCHAR(191) NULL,
    `destinationId` VARCHAR(191) NULL,
    `destinationUrl` VARCHAR(191) NOT NULL,
    `linkTitle` VARCHAR(191) NULL,
    `openInNewTab` BOOLEAN NOT NULL DEFAULT false,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `wholeWordOnly` BOOLEAN NOT NULL DEFAULT true,
    `caseSensitive` BOOLEAN NOT NULL DEFAULT false,
    `firstOccurrenceOnly` BOOLEAN NOT NULL DEFAULT false,
    `ignoreHeadings` BOOLEAN NOT NULL DEFAULT true,
    `ignoreExistingLinks` BOOLEAN NOT NULL DEFAULT true,
    `maxLinksPerPage` INTEGER NOT NULL DEFAULT 1,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `InternalLinkRule_tenantId_idx`(`tenantId`),
    INDEX `InternalLinkRule_keyword_idx`(`keyword`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BreadcrumbSettings` ADD CONSTRAINT `BreadcrumbSettings_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Redirect` ADD CONSTRAINT `Redirect_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotFoundLog` ADD CONSTRAINT `NotFoundLog_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RedirectImport` ADD CONSTRAINT `RedirectImport_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InternalLinkRule` ADD CONSTRAINT `InternalLinkRule_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

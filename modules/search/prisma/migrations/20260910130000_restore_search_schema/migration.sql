-- Restore the Search schema after the previous plugin-removal cleanup.
ALTER TABLE `page` ADD COLUMN `searchText` TEXT NULL;
ALTER TABLE `post` ADD COLUMN `searchText` TEXT NULL;

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

ALTER TABLE `SearchConfiguration`
  ADD CONSTRAINT `SearchConfiguration_tenantId_fkey`
  FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

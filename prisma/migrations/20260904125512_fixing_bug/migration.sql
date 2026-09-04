/*
  Warnings:

  - You are about to drop the column `turnstileEnabled` on the `sitesettings` table. All the data in the column will be lost.
  - You are about to drop the column `turnstileMode` on the `sitesettings` table. All the data in the column will be lost.
  - You are about to drop the column `turnstileSecretKey` on the `sitesettings` table. All the data in the column will be lost.
  - You are about to drop the column `turnstileSiteKey` on the `sitesettings` table. All the data in the column will be lost.
  - You are about to drop the `breadcrumbsettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `internallinkrule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notfoundlog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `redirect` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `redirectimport` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `breadcrumbsettings` DROP FOREIGN KEY `BreadcrumbSettings_tenantId_fkey`;

-- DropForeignKey
ALTER TABLE `internallinkrule` DROP FOREIGN KEY `InternalLinkRule_tenantId_fkey`;

-- DropForeignKey
ALTER TABLE `notfoundlog` DROP FOREIGN KEY `NotFoundLog_tenantId_fkey`;

-- DropForeignKey
ALTER TABLE `redirect` DROP FOREIGN KEY `Redirect_tenantId_fkey`;

-- DropForeignKey
ALTER TABLE `redirectimport` DROP FOREIGN KEY `RedirectImport_tenantId_fkey`;

-- AlterTable
ALTER TABLE `sitesettings` DROP COLUMN `turnstileEnabled`,
    DROP COLUMN `turnstileMode`,
    DROP COLUMN `turnstileSecretKey`,
    DROP COLUMN `turnstileSiteKey`;

-- DropTable
DROP TABLE `breadcrumbsettings`;

-- DropTable
DROP TABLE `internallinkrule`;

-- DropTable
DROP TABLE `notfoundlog`;

-- DropTable
DROP TABLE `redirect`;

-- DropTable
DROP TABLE `redirectimport`;

/*
  Warnings:

  - You are about to drop the `FileShare` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FileShareItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SharedFile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_sharedBy_fkey";

-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_sharedFileId_fkey";

-- DropForeignKey
ALTER TABLE "FileShareItem" DROP CONSTRAINT "FileShareItem_fileId_fkey";

-- DropForeignKey
ALTER TABLE "FileShareItem" DROP CONSTRAINT "FileShareItem_shareId_fkey";

-- DropForeignKey
ALTER TABLE "SharedFile" DROP CONSTRAINT "SharedFile_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "SharedFile" DROP CONSTRAINT "SharedFile_uploadedBy_fkey";

-- DropTable
DROP TABLE "FileShare";

-- DropTable
DROP TABLE "FileShareItem";

-- DropTable
DROP TABLE "SharedFile";

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedBy" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileShareLink" (
    "id" TEXT NOT NULL,
    "sharedWith" TEXT NOT NULL,
    "message" TEXT,
    "password" TEXT NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3),
    "zipDownloadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileShareFile" (
    "id" TEXT NOT NULL,
    "shareLinkId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "downloadedAt" TIMESTAMP(3),

    CONSTRAINT "FileShareFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UploadedFile_tenantId_idx" ON "UploadedFile"("tenantId");

-- CreateIndex
CREATE INDEX "UploadedFile_uploadedBy_idx" ON "UploadedFile"("uploadedBy");

-- CreateIndex
CREATE INDEX "UploadedFile_category_idx" ON "UploadedFile"("category");

-- CreateIndex
CREATE UNIQUE INDEX "FileShareLink_token_key" ON "FileShareLink"("token");

-- CreateIndex
CREATE INDEX "FileShareLink_token_idx" ON "FileShareLink"("token");

-- CreateIndex
CREATE INDEX "FileShareLink_createdBy_idx" ON "FileShareLink"("createdBy");

-- CreateIndex
CREATE INDEX "FileShareFile_shareLinkId_idx" ON "FileShareFile"("shareLinkId");

-- CreateIndex
CREATE INDEX "FileShareFile_fileId_idx" ON "FileShareFile"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "FileShareFile_shareLinkId_fileId_key" ON "FileShareFile"("shareLinkId", "fileId");

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShareLink" ADD CONSTRAINT "FileShareLink_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShareFile" ADD CONSTRAINT "FileShareFile_shareLinkId_fkey" FOREIGN KEY ("shareLinkId") REFERENCES "FileShareLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShareFile" ADD CONSTRAINT "FileShareFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "UploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

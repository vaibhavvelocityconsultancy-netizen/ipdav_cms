/*
  Warnings:

  - You are about to drop the column `downloadedAt` on the `FileShare` table. All the data in the column will be lost.
  - You are about to drop the column `fileId` on the `FileShare` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "FileShare" DROP CONSTRAINT "FileShare_fileId_fkey";

-- DropIndex
DROP INDEX "FileShare_fileId_idx";

-- AlterTable
ALTER TABLE "FileShare" DROP COLUMN "downloadedAt",
DROP COLUMN "fileId",
ADD COLUMN     "sharedFileId" TEXT,
ADD COLUMN     "zipDownloadedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "FileShareItem" (
    "id" TEXT NOT NULL,
    "shareId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "downloadedAt" TIMESTAMP(3),

    CONSTRAINT "FileShareItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FileShareItem_shareId_idx" ON "FileShareItem"("shareId");

-- CreateIndex
CREATE INDEX "FileShareItem_fileId_idx" ON "FileShareItem"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "FileShareItem_shareId_fileId_key" ON "FileShareItem"("shareId", "fileId");

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_sharedFileId_fkey" FOREIGN KEY ("sharedFileId") REFERENCES "SharedFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShareItem" ADD CONSTRAINT "FileShareItem_shareId_fkey" FOREIGN KEY ("shareId") REFERENCES "FileShare"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShareItem" ADD CONSTRAINT "FileShareItem_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "SharedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

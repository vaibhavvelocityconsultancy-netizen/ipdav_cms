/*
  Warnings:

  - You are about to drop the column `category` on the `UploadedFile` table. All the data in the column will be lost.
  - You are about to drop the column `fileCategoryId` on the `UploadedFile` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UploadedFile" DROP CONSTRAINT "UploadedFile_fileCategoryId_fkey";

-- DropIndex
DROP INDEX "UploadedFile_category_idx";

-- AlterTable
ALTER TABLE "UploadedFile" DROP COLUMN "category",
DROP COLUMN "fileCategoryId",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "isShareable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "shortDesc" TEXT;

-- CreateIndex
CREATE INDEX "UploadedFile_categoryId_idx" ON "UploadedFile"("categoryId");

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FileCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

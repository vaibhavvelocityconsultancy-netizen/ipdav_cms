-- AlterTable
ALTER TABLE "UploadedFile" ADD COLUMN     "fileCategoryId" TEXT;

-- CreateTable
CREATE TABLE "FileCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "tenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FileCategory_tenantId_idx" ON "FileCategory"("tenantId");

-- CreateIndex
CREATE INDEX "FileCategory_parentId_idx" ON "FileCategory"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "FileCategory_tenantId_slug_key" ON "FileCategory"("tenantId", "slug");

-- AddForeignKey
ALTER TABLE "FileCategory" ADD CONSTRAINT "FileCategory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileCategory" ADD CONSTRAINT "FileCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "FileCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_fileCategoryId_fkey" FOREIGN KEY ("fileCategoryId") REFERENCES "FileCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

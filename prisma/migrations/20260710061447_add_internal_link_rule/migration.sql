-- DropIndex
DROP INDEX "AICrawlSettings_tenantId_idx";

-- AlterTable
ALTER TABLE "AICrawlSettings" ADD COLUMN     "autoGenerateScripts" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "InternalLinkRule" (
    "id" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "keyword" TEXT NOT NULL,
    "destinationType" TEXT,
    "destinationId" TEXT,
    "destinationUrl" TEXT NOT NULL,
    "linkTitle" TEXT,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "wholeWordOnly" BOOLEAN NOT NULL DEFAULT true,
    "caseSensitive" BOOLEAN NOT NULL DEFAULT false,
    "firstOccurrenceOnly" BOOLEAN NOT NULL DEFAULT false,
    "ignoreHeadings" BOOLEAN NOT NULL DEFAULT true,
    "ignoreExistingLinks" BOOLEAN NOT NULL DEFAULT true,
    "maxLinksPerPage" INTEGER NOT NULL DEFAULT 1,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalLinkRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InternalLinkRule_tenantId_idx" ON "InternalLinkRule"("tenantId");

-- CreateIndex
CREATE INDEX "InternalLinkRule_keyword_idx" ON "InternalLinkRule"("keyword");

-- AddForeignKey
ALTER TABLE "InternalLinkRule" ADD CONSTRAINT "InternalLinkRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "AICrawlContent" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AICrawlContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AICrawlContent_tenantId_idx" ON "AICrawlContent"("tenantId");

-- CreateIndex
CREATE INDEX "AICrawlContent_contentType_idx" ON "AICrawlContent"("contentType");

-- CreateIndex
CREATE UNIQUE INDEX "AICrawlContent_tenantId_contentType_contentId_key" ON "AICrawlContent"("tenantId", "contentType", "contentId");

-- AddForeignKey
ALTER TABLE "AICrawlContent" ADD CONSTRAINT "AICrawlContent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

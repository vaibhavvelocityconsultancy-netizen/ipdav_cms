-- CreateTable
CREATE TABLE "Plan" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "billingPeriodDays" INTEGER,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanFeature" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "planId" INTEGER NOT NULL,

    CONSTRAINT "PlanFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanSubscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanEnrollment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Plan_tenantId_idx" ON "Plan"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_slug_tenantId_key" ON "Plan"("slug", "tenantId");

-- CreateIndex
CREATE INDEX "PlanFeature_planId_idx" ON "PlanFeature"("planId");

-- CreateIndex
CREATE INDEX "PlanSubscription_userId_idx" ON "PlanSubscription"("userId");

-- CreateIndex
CREATE INDEX "PlanSubscription_planId_idx" ON "PlanSubscription"("planId");

-- CreateIndex
CREATE INDEX "PlanSubscription_status_idx" ON "PlanSubscription"("status");

-- CreateIndex
CREATE INDEX "PlanSubscription_currentPeriodEnd_idx" ON "PlanSubscription"("currentPeriodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "PlanSubscription_userId_planId_key" ON "PlanSubscription"("userId", "planId");

-- CreateIndex
CREATE INDEX "PlanEnrollment_userId_idx" ON "PlanEnrollment"("userId");

-- CreateIndex
CREATE INDEX "PlanEnrollment_planId_idx" ON "PlanEnrollment"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanEnrollment_userId_planId_key" ON "PlanEnrollment"("userId", "planId");

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanSubscription" ADD CONSTRAINT "PlanSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanSubscription" ADD CONSTRAINT "PlanSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanEnrollment" ADD CONSTRAINT "PlanEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanEnrollment" ADD CONSTRAINT "PlanEnrollment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "trialDays" INTEGER;

-- AlterTable
ALTER TABLE "PlanSubscription" ADD COLUMN     "trialEndsAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'TRIALING';

-- CreateTable
CREATE TABLE "PlanSettings" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "defaultTrialDays" INTEGER NOT NULL DEFAULT 7,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanSettings_tenantId_key" ON "PlanSettings"("tenantId");

-- AddForeignKey
ALTER TABLE "PlanSettings" ADD CONSTRAINT "PlanSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

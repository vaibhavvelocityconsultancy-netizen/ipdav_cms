/*
  Warnings:

  - A unique constraint covering the columns `[paypalSubscriptionId]` on the table `PlanSubscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "paypalMonthlyPlanId" TEXT,
ADD COLUMN     "paypalYearlyPlanId" TEXT;

-- AlterTable
ALTER TABLE "PlanSubscription" ADD COLUMN     "paypalSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PlanSubscription_paypalSubscriptionId_key" ON "PlanSubscription"("paypalSubscriptionId");

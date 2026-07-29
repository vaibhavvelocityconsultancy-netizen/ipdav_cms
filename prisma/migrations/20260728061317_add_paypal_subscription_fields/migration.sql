/*
  Warnings:

  - A unique constraint covering the columns `[paypalSubscriptionId]` on the table `PlanSubscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SubscriptionStatus" ADD VALUE 'PENDING';
ALTER TYPE "SubscriptionStatus" ADD VALUE 'PAST_DUE';

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "paypalMonthlyPlanId" TEXT,
ADD COLUMN     "paypalYearlyPlanId" TEXT;

-- AlterTable
ALTER TABLE "PlanSubscription" ADD COLUMN     "paypalSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PlanSubscription_paypalSubscriptionId_key" ON "PlanSubscription"("paypalSubscriptionId");

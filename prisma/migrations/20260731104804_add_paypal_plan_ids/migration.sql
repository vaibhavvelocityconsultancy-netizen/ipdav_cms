/*
  Warnings:

  - A unique constraint covering the columns `[paypalSubscriptionId]` on the table `PlanSubscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'PAST_DUE';

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "paypalMonthlyPlanId" TEXT,
ADD COLUMN     "paypalYearlyPlanId" TEXT;

-- AlterTable
ALTER TABLE "PlanSubscription" ADD COLUMN     "paypalSubscriptionId" TEXT;

-- CreateTable
CREATE TABLE "PaypalWebhookEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaypalWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaypalWebhookEvent_eventId_key" ON "PaypalWebhookEvent"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanSubscription_paypalSubscriptionId_key" ON "PlanSubscription"("paypalSubscriptionId");

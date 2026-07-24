/*
  Warnings:

  - You are about to drop the column `billingCycle` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "billingCycle",
DROP COLUMN "price",
ADD COLUMN     "allowMonthly" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allowYearly" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "monthlyPrice" DECIMAL(10,2),
ADD COLUMN     "yearlyPrice" DECIMAL(10,2);

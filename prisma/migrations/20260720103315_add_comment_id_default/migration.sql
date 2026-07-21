/*
  Warnings:

  - The values [RAZORPAY] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `razorpayOrderId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `razorpayPaymentId` on the `Order` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('STRIPE', 'COD');
ALTER TABLE "public"."Order" ALTER COLUMN "paymentMethod" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
ALTER TABLE "Order" ALTER COLUMN "paymentMethod" SET DEFAULT 'STRIPE';
COMMIT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "razorpayOrderId",
DROP COLUMN "razorpayPaymentId";

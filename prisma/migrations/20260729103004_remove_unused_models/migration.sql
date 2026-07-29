/*
  Warnings:

  - The values [PAST_DUE] on the enum `SubscriptionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `coursesEnabled` on the `BreadcrumbSettings` table. All the data in the column will be lost.
  - You are about to drop the column `paypalMonthlyPlanId` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `paypalYearlyPlanId` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `paypalSubscriptionId` on the `PlanSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `coursesEnabled` on the `sitesettings` table. All the data in the column will be lost.
  - You are about to drop the column `coursesPageId` on the `sitesettings` table. All the data in the column will be lost.
  - You are about to drop the column `ecommerceEnabled` on the `sitesettings` table. All the data in the column will be lost.
  - You are about to drop the column `includeCourses` on the `sitesettings` table. All the data in the column will be lost.
  - You are about to drop the `Attribute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AttributeValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Brand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Coupon` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseContent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseEnrollment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseMaterial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseModule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomerAddress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EcommerceSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderNote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaypalWebhookEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PricingFeature` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductVariant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductVariantAttribute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShippingRate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShippingZone` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaxClass` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaxRate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProductToProductCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionStatus_new" AS ENUM ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELED', 'PENDING');
ALTER TABLE "public"."PlanSubscription" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Subscription" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Subscription" ALTER COLUMN "status" TYPE "SubscriptionStatus_new" USING ("status"::text::"SubscriptionStatus_new");
ALTER TABLE "PlanSubscription" ALTER COLUMN "status" TYPE "SubscriptionStatus_new" USING ("status"::text::"SubscriptionStatus_new");
ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
ALTER TYPE "SubscriptionStatus_new" RENAME TO "SubscriptionStatus";
DROP TYPE "public"."SubscriptionStatus_old";
ALTER TABLE "PlanSubscription" ALTER COLUMN "status" SET DEFAULT 'TRIAL';
ALTER TABLE "Subscription" ALTER COLUMN "status" SET DEFAULT 'TRIAL';
COMMIT;

-- DropForeignKey
ALTER TABLE "Attribute" DROP CONSTRAINT "Attribute_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "AttributeValue" DROP CONSTRAINT "AttributeValue_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "Brand" DROP CONSTRAINT "Brand_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Coupon" DROP CONSTRAINT "Coupon_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_courseContentId_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "CourseContent" DROP CONSTRAINT "CourseContent_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "CourseEnrollment" DROP CONSTRAINT "CourseEnrollment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseEnrollment" DROP CONSTRAINT "CourseEnrollment_userId_fkey";

-- DropForeignKey
ALTER TABLE "CourseMaterial" DROP CONSTRAINT "CourseMaterial_courseModuleId_fkey";

-- DropForeignKey
ALTER TABLE "CourseModule" DROP CONSTRAINT "CourseModule_courseContentId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerAddress" DROP CONSTRAINT "CustomerAddress_userId_fkey";

-- DropForeignKey
ALTER TABLE "EcommerceSettings" DROP CONSTRAINT "EcommerceSettings_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_variantId_fkey";

-- DropForeignKey
ALTER TABLE "OrderNote" DROP CONSTRAINT "OrderNote_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "PricingFeature" DROP CONSTRAINT "PricingFeature_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_brandId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_parentId_fkey";

-- DropForeignKey
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariantAttribute" DROP CONSTRAINT "ProductVariantAttribute_attributeValueId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariantAttribute" DROP CONSTRAINT "ProductVariantAttribute_variantId_fkey";

-- DropForeignKey
ALTER TABLE "ShippingRate" DROP CONSTRAINT "ShippingRate_zoneId_fkey";

-- DropForeignKey
ALTER TABLE "ShippingZone" DROP CONSTRAINT "ShippingZone_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_courseId_fkey";

-- DropForeignKey
ALTER TABLE "TaxClass" DROP CONSTRAINT "TaxClass_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "TaxRate" DROP CONSTRAINT "TaxRate_taxClassId_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToProductCategory" DROP CONSTRAINT "_ProductToProductCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToProductCategory" DROP CONSTRAINT "_ProductToProductCategory_B_fkey";

-- DropIndex
DROP INDEX "PlanSubscription_paypalSubscriptionId_key";

-- AlterTable
ALTER TABLE "BreadcrumbSettings" DROP COLUMN "coursesEnabled";

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "paypalMonthlyPlanId",
DROP COLUMN "paypalYearlyPlanId";

-- AlterTable
ALTER TABLE "PlanSubscription" DROP COLUMN "paypalSubscriptionId";

-- AlterTable
ALTER TABLE "sitesettings" DROP COLUMN "coursesEnabled",
DROP COLUMN "coursesPageId",
DROP COLUMN "ecommerceEnabled",
DROP COLUMN "includeCourses";

-- DropTable
DROP TABLE "Attribute";

-- DropTable
DROP TABLE "AttributeValue";

-- DropTable
DROP TABLE "Brand";

-- DropTable
DROP TABLE "Coupon";

-- DropTable
DROP TABLE "Course";

-- DropTable
DROP TABLE "CourseContent";

-- DropTable
DROP TABLE "CourseEnrollment";

-- DropTable
DROP TABLE "CourseMaterial";

-- DropTable
DROP TABLE "CourseModule";

-- DropTable
DROP TABLE "CustomerAddress";

-- DropTable
DROP TABLE "EcommerceSettings";

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "OrderItem";

-- DropTable
DROP TABLE "OrderNote";

-- DropTable
DROP TABLE "PaypalWebhookEvent";

-- DropTable
DROP TABLE "PricingFeature";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "ProductCategory";

-- DropTable
DROP TABLE "ProductImage";

-- DropTable
DROP TABLE "ProductVariant";

-- DropTable
DROP TABLE "ProductVariantAttribute";

-- DropTable
DROP TABLE "ShippingRate";

-- DropTable
DROP TABLE "ShippingZone";

-- DropTable
DROP TABLE "TaxClass";

-- DropTable
DROP TABLE "TaxRate";

-- DropTable
DROP TABLE "_ProductToProductCategory";

-- DropEnum
DROP TYPE "AddressType";

-- DropEnum
DROP TYPE "DiscountType";

-- DropEnum
DROP TYPE "OrderPaymentStatus";

-- DropEnum
DROP TYPE "OrderStatus";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "ProductStatus";

-- AlterTable: add module toggles to sitesettings (UI-only feature gates; default OFF)
ALTER TABLE "sitesettings"
  ADD COLUMN "coursesEnabled"   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "seoEnabled"       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "ecommerceEnabled" BOOLEAN NOT NULL DEFAULT false;

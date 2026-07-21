-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY', 'LIFETIME');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "rolepermission_role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR', 'VIEWER', 'SUBSCRIBER');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR', 'VIEWER', 'SUBSCRIBER');

-- CreateEnum
CREATE TYPE "post_status" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "comment_status" AS ENUM ('PENDING', 'APPROVED', 'SPAM', 'TRASH');

-- CreateEnum
CREATE TYPE "sitemapChangeFrequency" AS ENUM ('ALWAYS', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'NEVER');

-- CreateTable
CREATE TABLE "tenant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyticsSettings" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "gtmId" TEXT,
    "gtmHeadScript" TEXT,
    "gtmBodyScript" TEXT,
    "gaMeasurementId" TEXT,
    "gaHeadScript" TEXT,
    "facebookPixelId" TEXT,
    "facebookHeadScript" TEXT,
    "googleAdsId" TEXT,
    "googleAdsHeadScript" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "autoGenerateScripts" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "analyticsSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AICrawlSettings" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "enableMarkdownGeneration" BOOLEAN NOT NULL DEFAULT true,
    "includePages" BOOLEAN NOT NULL DEFAULT true,
    "includePosts" BOOLEAN NOT NULL DEFAULT true,
    "excludeDrafts" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AICrawlSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "user_role" NOT NULL DEFAULT 'SUBSCRIBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" INTEGER NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "instructor" TEXT,
    "thumbnail" TEXT,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'LIFETIME',
    "billingPeriodDays" INTEGER,
    "durationHours" INTEGER,
    "level" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "tenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sitemapEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sitemapPriority" DECIMAL(2,1) NOT NULL DEFAULT 0.8,
    "sitemapChangeFreq" "sitemapChangeFrequency" NOT NULL DEFAULT 'WEEKLY',
    "courseContentId" INTEGER,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingFeature" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "PricingFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseContent" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "longDescription" TEXT,
    "thumbnail" TEXT,
    "instructor" TEXT,
    "level" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseModule" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "videoType" TEXT NOT NULL DEFAULT 'URL',
    "videoUrl" TEXT NOT NULL DEFAULT '',
    "durationMinutes" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "courseContentId" INTEGER NOT NULL,

    CONSTRAINT "CourseModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseMaterial" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PDF',
    "url" TEXT NOT NULL,
    "size" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "courseModuleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "courseId" INTEGER,
    "planId" INTEGER,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'LIFETIME',
    "stripePaymentIntentId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseEnrollment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billingCycle" TEXT NOT NULL DEFAULT 'LIFETIME',

    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rolepermission" (
    "id" SERIAL NOT NULL,
    "role" "rolepermission_role" NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "rolepermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userpermission" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "userpermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "css" TEXT,
    "js" TEXT,
    "jsxCode" TEXT,
    "pageType" TEXT NOT NULL DEFAULT 'html',
    "status" "post_status" NOT NULL DEFAULT 'PUBLISHED',
    "seoData" JSONB,
    "sitemapEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sitemapPriority" DECIMAL(2,1) NOT NULL DEFAULT 0.8,
    "sitemapChangeFreq" "sitemapChangeFrequency" NOT NULL DEFAULT 'WEEKLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" INTEGER NOT NULL,

    CONSTRAINT "page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT,
    "status" "post_status" NOT NULL DEFAULT 'PUBLISHED',
    "authorId" INTEGER,
    "seoData" JSONB,
    "publishedAt" TIMESTAMP(3),
    "sitemapEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sitemapPriority" DECIMAL(2,1) NOT NULL DEFAULT 0.8,
    "sitemapChangeFreq" "sitemapChangeFrequency" NOT NULL DEFAULT 'WEEKLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'standard',
    "tenantId" INTEGER NOT NULL,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "tenantId" INTEGER NOT NULL,
    "sitemapEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sitemapPriority" DECIMAL(2,1) NOT NULL DEFAULT 0.5,
    "sitemapChangeFreq" "sitemapChangeFrequency" NOT NULL DEFAULT 'WEEKLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "sitemapEnabled" BOOLEAN NOT NULL DEFAULT false,
    "sitemapPriority" DECIMAL(2,1) NOT NULL DEFAULT 0.8,
    "sitemapChangeFreq" "sitemapChangeFrequency" NOT NULL DEFAULT 'WEEKLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "authorUrl" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" "comment_status" NOT NULL DEFAULT 'PENDING',
    "postId" TEXT NOT NULL,
    "userId" INTEGER,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" VARCHAR(255),
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "altText" TEXT,
    "title" TEXT,
    "caption" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" INTEGER NOT NULL,
    "collectionId" INTEGER,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT 'none',
    "tenantId" INTEGER NOT NULL,

    CONSTRAINT "menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menuitem" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "slug" TEXT,
    "url" TEXT,
    "order" INTEGER NOT NULL,
    "menuId" INTEGER NOT NULL,
    "parentId" INTEGER,

    CONSTRAINT "menuitem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "submitButtonLabel" TEXT DEFAULT 'Submit',
    "confirmationType" TEXT NOT NULL DEFAULT 'message',
    "confirmationMessage" TEXT,
    "redirectUrl" TEXT,
    "emails" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" INTEGER NOT NULL,

    CONSTRAINT "form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formsubmission" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "formsubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sitesettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "siteName" TEXT,
    "siteTagline" TEXT,
    "logo" TEXT,
    "favicon" TEXT,
    "defaultMetaTitle" TEXT,
    "defaultMetaDescription" TEXT,
    "postsPerPage" INTEGER NOT NULL DEFAULT 10,
    "homepageType" TEXT NOT NULL DEFAULT 'posts',
    "homepagePageId" INTEGER,
    "postsPageId" INTEGER,
    "coursesPageId" INTEGER,
    "globalCss" TEXT,
    "globalJs" TEXT,
    "showAdminToolbar" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sitemapEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sitemapCacheMinutes" INTEGER NOT NULL DEFAULT 10,
    "sitemapLastGeneratedAt" TIMESTAMP(3),
    "sitemapCustomUrl" TEXT,
    "includePages" BOOLEAN NOT NULL DEFAULT true,
    "includePosts" BOOLEAN NOT NULL DEFAULT true,
    "includeCategories" BOOLEAN NOT NULL DEFAULT true,
    "includeTags" BOOLEAN NOT NULL DEFAULT false,
    "includeCourses" BOOLEAN NOT NULL DEFAULT true,
    "pingSearchEngines" BOOLEAN NOT NULL DEFAULT false,
    "cachedSitemapXml" TEXT,
    "cachedSitemapExpiresAt" TIMESTAMP(3),
    "robotsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "robotsContent" TEXT,

    CONSTRAINT "sitesettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingSettings" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "gtmId" TEXT,
    "gaMeasurementId" TEXT,
    "facebookPixelId" TEXT,
    "googleAdsId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footersettings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "footersettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavbarConfig" (
    "id" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "bgColor" TEXT NOT NULL DEFAULT '#0B0F1A',
    "bgOpacity" INTEGER NOT NULL DEFAULT 90,
    "linkColor" TEXT NOT NULL DEFAULT '#cbd5e1',
    "linkHoverColor" TEXT NOT NULL DEFAULT '#ffffff',
    "accentColor" TEXT NOT NULL DEFAULT '#22d3ee',
    "dropdownBg" TEXT NOT NULL DEFAULT '#111827',
    "sticky" BOOLEAN NOT NULL DEFAULT true,
    "blur" BOOLEAN NOT NULL DEFAULT true,
    "showLogin" BOOLEAN NOT NULL DEFAULT true,
    "showSignup" BOOLEAN NOT NULL DEFAULT true,
    "showPricing" BOOLEAN NOT NULL DEFAULT true,
    "loginLabel" TEXT NOT NULL DEFAULT 'Log In',
    "signupLabel" TEXT NOT NULL DEFAULT 'Sign Up',
    "pricingLabel" TEXT NOT NULL DEFAULT 'Pricing',
    "customCss" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NavbarConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterConfig" (
    "id" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "bgColor" TEXT NOT NULL DEFAULT '#0B0F1A',
    "borderColor" TEXT NOT NULL DEFAULT '#ffffff',
    "borderOpacity" INTEGER NOT NULL DEFAULT 8,
    "headingColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#cbd5e1',
    "mutedTextColor" TEXT NOT NULL DEFAULT '#94a3b8',
    "bottomTextColor" TEXT NOT NULL DEFAULT '#64748b',
    "accentColor" TEXT NOT NULL DEFAULT '#22d3ee',
    "accentHoverColor" TEXT NOT NULL DEFAULT '#67e8f9',
    "ctaTextColor" TEXT NOT NULL DEFAULT '#0f172a',
    "eyebrowText" TEXT NOT NULL DEFAULT 'Let''s Start a Conversation',
    "headline" TEXT NOT NULL DEFAULT 'Ready to grow your business?',
    "showCta" BOOLEAN NOT NULL DEFAULT true,
    "customCss" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FooterConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreadcrumbSettings" (
    "id" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "homeLabel" TEXT NOT NULL DEFAULT 'Home',
    "homeUrl" TEXT,
    "separator" TEXT NOT NULL DEFAULT '/',
    "showHome" BOOLEAN NOT NULL DEFAULT true,
    "showCurrent" BOOLEAN NOT NULL DEFAULT true,
    "showParent" BOOLEAN NOT NULL DEFAULT true,
    "pagesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "postsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "categoriesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "tagsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "coursesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "hideOnHome" BOOLEAN NOT NULL DEFAULT true,
    "hideOn404" BOOLEAN NOT NULL DEFAULT true,
    "hideOnSearch" BOOLEAN NOT NULL DEFAULT false,
    "schemaEnabled" BOOLEAN NOT NULL DEFAULT true,
    "cssClass" TEXT,
    "customCss" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BreadcrumbSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redirect" (
    "id" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "destinationUrl" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "isAutoDetected" BOOLEAN NOT NULL DEFAULT false,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "tenantId" INTEGER NOT NULL,

    CONSTRAINT "Redirect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotFoundLog" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "suggestedUrl" TEXT,
    "redirectId" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" INTEGER NOT NULL,

    CONSTRAINT "NotFoundLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedirectImport" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "successCount" INTEGER NOT NULL,
    "failureCount" INTEGER NOT NULL,
    "errors" TEXT,
    "importedBy" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" INTEGER NOT NULL,

    CONSTRAINT "RedirectImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_posttotag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_posttotag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_categorytopost" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_categorytopost_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_slug_key" ON "tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "analyticsSettings_tenantId_key" ON "analyticsSettings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "AICrawlSettings_tenantId_key" ON "AICrawlSettings"("tenantId");

-- CreateIndex
CREATE INDEX "AICrawlSettings_tenantId_idx" ON "AICrawlSettings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Course_courseContentId_key" ON "Course"("courseContentId");

-- CreateIndex
CREATE INDEX "Course_tenantId_idx" ON "Course"("tenantId");

-- CreateIndex
CREATE INDEX "Course_isPublished_isFeatured_idx" ON "Course"("isPublished", "isFeatured");

-- CreateIndex
CREATE INDEX "Course_sortOrder_idx" ON "Course"("sortOrder");

-- CreateIndex
CREATE INDEX "Course_billingCycle_idx" ON "Course"("billingCycle");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_tenantId_key" ON "Course"("slug", "tenantId");

-- CreateIndex
CREATE INDEX "PricingFeature_courseId_idx" ON "PricingFeature"("courseId");

-- CreateIndex
CREATE INDEX "CourseContent_tenantId_idx" ON "CourseContent"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseContent_slug_tenantId_key" ON "CourseContent"("slug", "tenantId");

-- CreateIndex
CREATE INDEX "CourseModule_courseContentId_idx" ON "CourseModule"("courseContentId");

-- CreateIndex
CREATE INDEX "CourseMaterial_courseModuleId_idx" ON "CourseMaterial"("courseModuleId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_courseId_idx" ON "Payment"("courseId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_stripePaymentIntentId_idx" ON "Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_courseId_idx" ON "Subscription"("courseId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_currentPeriodEnd_idx" ON "Subscription"("currentPeriodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_courseId_key" ON "Subscription"("userId", "courseId");

-- CreateIndex
CREATE INDEX "CourseEnrollment_userId_idx" ON "CourseEnrollment"("userId");

-- CreateIndex
CREATE INDEX "CourseEnrollment_courseId_idx" ON "CourseEnrollment"("courseId");

-- CreateIndex
CREATE INDEX "CourseEnrollment_purchasedAt_idx" ON "CourseEnrollment"("purchasedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEnrollment_userId_courseId_key" ON "CourseEnrollment"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "permission_name_key" ON "permission"("name");

-- CreateIndex
CREATE INDEX "permission_name_idx" ON "permission"("name");

-- CreateIndex
CREATE INDEX "rolepermission_permissionId_idx" ON "rolepermission"("permissionId");

-- CreateIndex
CREATE INDEX "rolepermission_role_idx" ON "rolepermission"("role");

-- CreateIndex
CREATE UNIQUE INDEX "rolepermission_role_permissionId_key" ON "rolepermission"("role", "permissionId");

-- CreateIndex
CREATE INDEX "userpermission_permissionId_idx" ON "userpermission"("permissionId");

-- CreateIndex
CREATE INDEX "userpermission_userId_idx" ON "userpermission"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "userpermission_userId_permissionId_key" ON "userpermission"("userId", "permissionId");

-- CreateIndex
CREATE INDEX "page_tenantId_idx" ON "page"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "page_tenantId_slug_key" ON "page"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "post_authorId_idx" ON "post"("authorId");

-- CreateIndex
CREATE INDEX "post_tenantId_idx" ON "post"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "post_tenantId_slug_key" ON "post"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "category_tenantId_idx" ON "category"("tenantId");

-- CreateIndex
CREATE INDEX "category_parentId_idx" ON "category"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "category_tenantId_slug_key" ON "category"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "tag_tenantId_idx" ON "tag"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "tag_tenantId_slug_key" ON "tag"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "comment_parentId_idx" ON "comment"("parentId");

-- CreateIndex
CREATE INDEX "comment_postId_idx" ON "comment"("postId");

-- CreateIndex
CREATE INDEX "comment_userId_idx" ON "comment"("userId");

-- CreateIndex
CREATE INDEX "media_tenantId_idx" ON "media"("tenantId");

-- CreateIndex
CREATE INDEX "media_collectionId_idx" ON "media"("collectionId");

-- CreateIndex
CREATE INDEX "collection_userId_idx" ON "collection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "collection_userId_name_key" ON "collection"("userId", "name");

-- CreateIndex
CREATE INDEX "menuitem_menuId_idx" ON "menuitem"("menuId");

-- CreateIndex
CREATE INDEX "menuitem_parentId_idx" ON "menuitem"("parentId");

-- CreateIndex
CREATE INDEX "form_tenantId_idx" ON "form"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "form_tenantId_slug_key" ON "form"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "formsubmission_formId_idx" ON "formsubmission"("formId");

-- CreateIndex
CREATE UNIQUE INDEX "sitesettings_tenantId_key" ON "sitesettings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackingSettings_tenantId_key" ON "TrackingSettings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "footersettings_key_key" ON "footersettings"("key");

-- CreateIndex
CREATE INDEX "footersettings_tenantId_idx" ON "footersettings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "NavbarConfig_tenantId_key" ON "NavbarConfig"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "FooterConfig_tenantId_key" ON "FooterConfig"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "BreadcrumbSettings_tenantId_key" ON "BreadcrumbSettings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Redirect_sourceUrl_key" ON "Redirect"("sourceUrl");

-- CreateIndex
CREATE INDEX "Redirect_sourceUrl_idx" ON "Redirect"("sourceUrl");

-- CreateIndex
CREATE INDEX "Redirect_isActive_idx" ON "Redirect"("isActive");

-- CreateIndex
CREATE INDEX "NotFoundLog_path_idx" ON "NotFoundLog"("path");

-- CreateIndex
CREATE INDEX "NotFoundLog_isResolved_idx" ON "NotFoundLog"("isResolved");

-- CreateIndex
CREATE INDEX "_posttotag_B_index" ON "_posttotag"("B");

-- CreateIndex
CREATE INDEX "_categorytopost_B_index" ON "_categorytopost"("B");

-- AddForeignKey
ALTER TABLE "analyticsSettings" ADD CONSTRAINT "analyticsSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AICrawlSettings" ADD CONSTRAINT "AICrawlSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_courseContentId_fkey" FOREIGN KEY ("courseContentId") REFERENCES "CourseContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingFeature" ADD CONSTRAINT "PricingFeature_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseContent" ADD CONSTRAINT "CourseContent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseModule" ADD CONSTRAINT "CourseModule_courseContentId_fkey" FOREIGN KEY ("courseContentId") REFERENCES "CourseContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMaterial" ADD CONSTRAINT "CourseMaterial_courseModuleId_fkey" FOREIGN KEY ("courseModuleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rolepermission" ADD CONSTRAINT "rolepermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userpermission" ADD CONSTRAINT "userpermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userpermission" ADD CONSTRAINT "userpermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page" ADD CONSTRAINT "page_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection" ADD CONSTRAINT "collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection" ADD CONSTRAINT "collection_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu" ADD CONSTRAINT "menu_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menuitem" ADD CONSTRAINT "menuitem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menuitem" ADD CONSTRAINT "menuitem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "menuitem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form" ADD CONSTRAINT "form_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formsubmission" ADD CONSTRAINT "formsubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sitesettings" ADD CONSTRAINT "sitesettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingSettings" ADD CONSTRAINT "TrackingSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footersettings" ADD CONSTRAINT "footersettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NavbarConfig" ADD CONSTRAINT "NavbarConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterConfig" ADD CONSTRAINT "FooterConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreadcrumbSettings" ADD CONSTRAINT "BreadcrumbSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redirect" ADD CONSTRAINT "Redirect_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotFoundLog" ADD CONSTRAINT "NotFoundLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedirectImport" ADD CONSTRAINT "RedirectImport_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_posttotag" ADD CONSTRAINT "_posttotag_A_fkey" FOREIGN KEY ("A") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_posttotag" ADD CONSTRAINT "_posttotag_B_fkey" FOREIGN KEY ("B") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_categorytopost" ADD CONSTRAINT "_categorytopost_A_fkey" FOREIGN KEY ("A") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_categorytopost" ADD CONSTRAINT "_categorytopost_B_fkey" FOREIGN KEY ("B") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- AlterTable
ALTER TABLE "BreadcrumbSettings" ADD COLUMN     "currentColor" TEXT NOT NULL DEFAULT '#6b7280',
ADD COLUMN     "linkColor" TEXT NOT NULL DEFAULT '#4b5563',
ADD COLUMN     "linkHoverColor" TEXT NOT NULL DEFAULT '#111827',
ADD COLUMN     "separatorColor" TEXT NOT NULL DEFAULT '#9ca3af';

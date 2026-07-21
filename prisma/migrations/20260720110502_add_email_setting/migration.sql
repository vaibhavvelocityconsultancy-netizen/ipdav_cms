-- CreateTable
CREATE TABLE "EmailSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "senderName" TEXT NOT NULL DEFAULT '',
    "fromEmail" TEXT NOT NULL DEFAULT '',
    "replyToEmail" TEXT,
    "adminEmail" TEXT NOT NULL DEFAULT '',
    "lastTestStatus" TEXT,
    "lastTestAt" TIMESTAMP(3),
    "lastTestError" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSettings_pkey" PRIMARY KEY ("id")
);

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SubscriptionPlan" ADD VALUE 'ESENCIAL';
ALTER TYPE "SubscriptionPlan" ADD VALUE 'PREMIUM';
ALTER TYPE "SubscriptionPlan" ADD VALUE 'FREE';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "subscriptionPlan" SET DEFAULT 'FREE';

-- CreateTable
CREATE TABLE "DailyInspiration" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "generatedBy" TEXT NOT NULL DEFAULT 'openai',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyInspiration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyInspiration_date_key" ON "DailyInspiration"("date");

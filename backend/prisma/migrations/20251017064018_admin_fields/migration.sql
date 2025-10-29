-- AlterTable
ALTER TABLE "users" ADD COLUMN     "autoRenewal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readingBonus" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trialActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trialExpiry" TIMESTAMP(3);

/*
  Warnings:

  - The values [MAESTRO] on the enum `SubscriptionPlan` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `keywords` on the `runes` table. All the data in the column will be lost.
  - You are about to drop the column `reversedMeaning` on the `runes` table. All the data in the column will be lost.
  - You are about to drop the column `runeSet` on the `runes` table. All the data in the column will be lost.
  - You are about to drop the `Objetivo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dreams` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `type` on table `decks` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionPlan_new" AS ENUM ('INVITADO', 'INICIADO', 'ADEPTO');
ALTER TABLE "public"."users" ALTER COLUMN "subscriptionPlan" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "subscriptionPlan" TYPE "SubscriptionPlan_new" USING ("subscriptionPlan"::text::"SubscriptionPlan_new");
ALTER TABLE "subscription_history" ALTER COLUMN "plan" TYPE "SubscriptionPlan_new" USING ("plan"::text::"SubscriptionPlan_new");
ALTER TYPE "SubscriptionPlan" RENAME TO "SubscriptionPlan_old";
ALTER TYPE "SubscriptionPlan_new" RENAME TO "SubscriptionPlan";
DROP TYPE "public"."SubscriptionPlan_old";
ALTER TABLE "users" ALTER COLUMN "subscriptionPlan" SET DEFAULT 'INVITADO';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."dreams" DROP CONSTRAINT "dreams_userId_fkey";

-- AlterTable
ALTER TABLE "decks" ALTER COLUMN "type" SET NOT NULL;

-- AlterTable
ALTER TABLE "runes" DROP COLUMN "keywords",
DROP COLUMN "reversedMeaning",
DROP COLUMN "runeSet",
ADD COLUMN     "svg" TEXT,
ALTER COLUMN "imageUrl" DROP NOT NULL,
ALTER COLUMN "prompt" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."Objetivo";

-- DropTable
DROP TABLE "public"."dreams";

-- CreateTable
CREATE TABLE "TrialCoupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usedBy" TEXT,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrialCoupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrialCoupon_code_key" ON "TrialCoupon"("code");

-- AddForeignKey
ALTER TABLE "TrialCoupon" ADD CONSTRAINT "TrialCoupon_usedBy_fkey" FOREIGN KEY ("usedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the `blog_posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BonusStatus" AS ENUM ('PURCHASED', 'ACTIVE', 'EXPIRED', 'REFUNDED');

-- AlterEnum
ALTER TYPE "SubscriptionPlan" ADD VALUE 'MAESTRO';

-- DropForeignKey
ALTER TABLE "public"."blog_posts" DROP CONSTRAINT "blog_posts_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."order_items" DROP CONSTRAINT "order_items_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."order_items" DROP CONSTRAINT "order_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_userId_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "aiDescription" TEXT,
ADD COLUMN     "geoDescription" TEXT,
ADD COLUMN     "resetPasswordExpires" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT;

-- DropTable
DROP TABLE "public"."blog_posts";

-- DropTable
DROP TABLE "public"."order_items";

-- DropTable
DROP TABLE "public"."orders";

-- DropTable
DROP TABLE "public"."products";

-- DropEnum
DROP TYPE "public"."OrderStatus";

-- DropEnum
DROP TYPE "public"."PostStatus";

-- DropEnum
DROP TYPE "public"."ProductCategory";

-- DropEnum
DROP TYPE "public"."ProductStatus";

-- CreateTable
CREATE TABLE "FeedbackBizum" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "opinion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackBizum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dreams" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dreamText" TEXT NOT NULL,
    "feelings" TEXT[],
    "interpretation" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dreams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "natal_charts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthTime" TEXT,
    "birthLocation" JSONB NOT NULL,
    "zodiacSign" TEXT NOT NULL,
    "planetPositions" JSONB NOT NULL,
    "houses" JSONB NOT NULL,
    "aspects" JSONB NOT NULL,
    "interpretation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "natal_charts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personalized_horoscopes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "natalChartId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "transits" TEXT NOT NULL,
    "zodiacSign" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personalized_horoscopes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_bonuses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "status" "BonusStatus" NOT NULL DEFAULT 'PURCHASED',
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "features" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "natal_charts_userId_key" ON "natal_charts"("userId");

-- AddForeignKey
ALTER TABLE "FeedbackBizum" ADD CONSTRAINT "FeedbackBizum_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dreams" ADD CONSTRAINT "dreams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "natal_charts" ADD CONSTRAINT "natal_charts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personalized_horoscopes" ADD CONSTRAINT "personalized_horoscopes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personalized_horoscopes" ADD CONSTRAINT "personalized_horoscopes_natalChartId_fkey" FOREIGN KEY ("natalChartId") REFERENCES "natal_charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_bonuses" ADD CONSTRAINT "weekly_bonuses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

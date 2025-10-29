-- Prisma migration: agregar modelo TrialCoupon
CREATE TABLE "TrialCoupon" (
  "id" SERIAL PRIMARY KEY,
  "code" VARCHAR(32) UNIQUE NOT NULL,
  "isActive" BOOLEAN DEFAULT TRUE,
  "usedBy" INTEGER REFERENCES "User"(id),
  "usedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
-- Índice para búsquedas rápidas
CREATE INDEX "idx_trialcoupon_code" ON "TrialCoupon"("code");

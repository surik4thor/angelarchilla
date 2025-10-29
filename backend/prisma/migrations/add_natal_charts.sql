-- Migración: Agregar tabla natal_charts
-- Fecha: 2025-10-29
-- Descripción: Crear tabla para cartas natales de usuarios

CREATE TABLE IF NOT EXISTS "natal_charts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthTime" TEXT,
    "birthLocation" JSONB NOT NULL DEFAULT '{}',
    "zodiacSign" TEXT NOT NULL,
    "planetPositions" JSONB NOT NULL DEFAULT '{}',
    "houses" JSONB NOT NULL DEFAULT '{}',
    "aspects" JSONB NOT NULL DEFAULT '[]',
    "interpretation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "natal_charts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Crear índices para mejorar las consultas
CREATE INDEX IF NOT EXISTS "natal_charts_userId_idx" ON "natal_charts"("userId");
CREATE INDEX IF NOT EXISTS "natal_charts_zodiacSign_idx" ON "natal_charts"("zodiacSign");
CREATE INDEX IF NOT EXISTS "natal_charts_birthDate_idx" ON "natal_charts"("birthDate");
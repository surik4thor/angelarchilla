-- Migración: Agregar tabla dreams
-- Fecha: 2025-10-29
-- Descripción: Crear tabla para interpretaciones de sueños

CREATE TABLE IF NOT EXISTS "dreams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dreamText" TEXT NOT NULL,
    "feelings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interpretation" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "dreams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Crear índice para mejorar las consultas por usuario
CREATE INDEX IF NOT EXISTS "dreams_userId_idx" ON "dreams"("userId");
CREATE INDEX IF NOT EXISTS "dreams_date_idx" ON "dreams"("date");
CREATE INDEX IF NOT EXISTS "dreams_createdAt_idx" ON "dreams"("createdAt");
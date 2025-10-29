-- CreateTable
CREATE TABLE "Objetivo" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "descripcion" TEXT,
    "actualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Objetivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Objetivo_clave_key" ON "Objetivo"("clave");

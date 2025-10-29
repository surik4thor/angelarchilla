-- CreateTable
CREATE TABLE "openai_call" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "prompt" TEXT,
    "model" TEXT,
    "tokens" INTEGER,
    "cost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "openai_call_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "openai_call" ADD CONSTRAINT "openai_call_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

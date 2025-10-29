-- CreateTable
CREATE TABLE "consentimiento_newsletter" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ip" TEXT,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedLegal" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,

    CONSTRAINT "consentimiento_newsletter_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "consentimiento_newsletter" ADD CONSTRAINT "consentimiento_newsletter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

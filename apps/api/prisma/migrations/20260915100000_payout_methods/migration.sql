-- Seller payout destinations. Account numbers are AES-256-GCM encrypted at rest; only the last 4 digits are stored in clear.
CREATE TYPE "PayoutMethodType" AS ENUM ('bank_account', 'ewallet');

CREATE TABLE "PayoutMethod" (
  "id"              TEXT NOT NULL,
  "userId"          TEXT NOT NULL,
  "type"            "PayoutMethodType" NOT NULL DEFAULT 'bank_account',
  "label"           TEXT NOT NULL,
  "holderName"      TEXT NOT NULL,
  "institution"     TEXT NOT NULL,
  "accountLast4"    TEXT NOT NULL,
  "accountEncrypted" TEXT NOT NULL,
  "routing"         TEXT,
  "country"         TEXT NOT NULL DEFAULT 'ID',
  "isDefault"       BOOLEAN NOT NULL DEFAULT false,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PayoutMethod_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PayoutMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "PayoutMethod_userId_idx" ON "PayoutMethod"("userId");

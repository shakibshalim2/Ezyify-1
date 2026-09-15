-- Identity verification submissions. ID numbers are AES-256-GCM encrypted at rest; only last4 is stored in clear.
CREATE TYPE "KycDocumentType" AS ENUM ('passport', 'national_id', 'driving_license');
CREATE TYPE "KycStatus" AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE "KycSubmission" (
  "id"                TEXT NOT NULL,
  "userId"            TEXT NOT NULL,
  "status"            "KycStatus" NOT NULL DEFAULT 'pending',
  "documentType"      "KycDocumentType" NOT NULL,
  "fullName"          TEXT NOT NULL,
  "idNumberEncrypted" TEXT NOT NULL,
  "idNumberLast4"     TEXT NOT NULL,
  "dateOfBirth"       TEXT NOT NULL,
  "country"           TEXT NOT NULL,
  "documentFrontUrl"  TEXT NOT NULL,
  "documentBackUrl"   TEXT,
  "selfieUrl"         TEXT NOT NULL,
  "rejectionReason"   TEXT,
  "reviewedById"      TEXT,
  "submittedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt"        TIMESTAMP(3),
  CONSTRAINT "KycSubmission_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "KycSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "KycSubmission_userId_submittedAt_idx" ON "KycSubmission"("userId", "submittedAt");
CREATE INDEX "KycSubmission_status_submittedAt_idx" ON "KycSubmission"("status", "submittedAt");

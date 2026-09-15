-- Report queue priority: 2 = child safety (CSAE), 1 = self-harm / violence, 0 = default.
ALTER TABLE "Report" ADD COLUMN "priority" INTEGER NOT NULL DEFAULT 0;
DROP INDEX IF EXISTS "Report_status_createdAt_idx";
CREATE INDEX "Report_status_priority_createdAt_idx" ON "Report"("status", "priority" DESC, "createdAt");

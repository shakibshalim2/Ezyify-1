CREATE TYPE "LiveSessionStatus" AS ENUM ('scheduled', 'live', 'ended');

CREATE TABLE "LiveSession" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "status" "LiveSessionStatus" NOT NULL,
    "category" VARCHAR(80),
    "coverUrl" TEXT,
    "productIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "pinnedProductId" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "peakViewers" INTEGER NOT NULL DEFAULT 0,
    "scheduledFor" TIMESTAMPTZ,
    "startedAt" TIMESTAMPTZ,
    "endedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "LiveSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LiveViewer" (
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveViewer_pkey" PRIMARY KEY ("sessionId", "userId")
);

CREATE INDEX "LiveSession_status_startedAt_idx" ON "LiveSession"("status", "startedAt");
CREATE INDEX "LiveSession_hostId_idx" ON "LiveSession"("hostId");
CREATE INDEX "LiveViewer_sessionId_lastSeenAt_idx" ON "LiveViewer"("sessionId", "lastSeenAt");

ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveViewer" ADD CONSTRAINT "LiveViewer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveViewer" ADD CONSTRAINT "LiveViewer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

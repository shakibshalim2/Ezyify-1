-- Per-category push/email opt-ins; NULL means "use defaults" (see DEFAULT_NOTIFICATION_PREFERENCES in @ezyify/core).
ALTER TABLE "User" ADD COLUMN "notificationPrefs" JSONB;

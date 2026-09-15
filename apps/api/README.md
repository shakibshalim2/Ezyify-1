# @ezyify/api — NestJS 12 · Fastify 5 · Prisma 7 · PostgreSQL

Implements `BACKEND_API_SPECIFICATION.md` behind the `@ezyify/core` zod contract: every request body is validated with the
same schema the web/mobile clients use, and every response is shaped by the same types, so drift fails at compile time.

## Run locally

```bash
# 1. Postgres (any 14+); create the dev + test databases once
createdb ezyify && createdb ezyify_test
cp .env.example .env            # set JWT_*_SECRET (openssl rand -base64 48)
pnpm prisma:migrate             # applies prisma/migrations
pnpm db:seed                    # demo users/products/posts (password: Password1)
pnpm dev                        # http://localhost:4000/v1 · Swagger UI at /v1/docs
```

Seeded logins: `buyer@ezyify.test` (wallet 500.00), `techstore@ezyify.test` (seller), `maya@ezyify.test` (creator), `admin@ezyify.test`.

## Layout

```
prisma/schema.prisma      data model (money = integer minor units)
src/config.ts             zod-validated env — refuses to boot on bad secrets
src/common/               envelope interceptor, error filter (spec codes), zod pipe, pagination
src/modules/auth          argon2id, JWT access (15 min) + rotating refresh (7 d, reuse detection), OTP, cookie (web) / body (native)
src/modules/users         profiles, follow, block-aware visibility
src/modules/catalog       products, categories, sort/filter
src/modules/cart          server cart, coupons, pricing (shared with checkout)
src/modules/orders        checkout fan-out per seller, escrow state machine, idempotency, auto-release cron
src/modules/wallet        balances + double-entry style transactions
src/modules/feed          posts/loops/stories, likes/saves/comments, blocked-author filtering
src/modules/messaging     conversations + Socket.IO gateway (/realtime)
src/modules/notifications in-app notifications, device registration, FCM HTTP v1 push
src/modules/search        GET /search → products/users/posts; Meilisearch or Postgres fallback + indexer
src/modules/live          LiveKit tokens for live shopping rooms and 1:1 calls
src/modules/account       Play-policy account deletion (soft, 30-day purge), data export, addresses
src/modules/moderation    reports, block/unblock, admin review queue
```

## Conventions

- Controllers return plain data; `EnvelopeInterceptor` wraps it as `{ success: true, data }`. Use `raw()` to bypass.
- Throw `ApiException`/helpers from `common/errors.ts`; the filter renders `{ success:false, error:{ code, message, details } }`.
- Native clients send `X-Client: native` and receive the refresh token in the body; web gets an httpOnly cookie.
- Payment/checkout endpoints accept `Idempotency-Key`.
- Tests: `pnpm test` (vitest; migrates + seeds `ezyify_test`, then unit + e2e through the real Fastify stack).

## Providers

Every third-party integration is an adapter behind env vars; unset means "degrade, don't crash" so dev/test never
need network access.

| Provider | Env | When unset |
| --- | --- | --- |
| Postgres | `DATABASE_URL` | required |
| MFA secret encryption (`auth/mfa.crypto.ts`) | `MFA_ENCRYPTION_KEY` (base64, 32 bytes) | required in production; dev/test derive a key from `JWT_REFRESH_SECRET` |
| Stripe (cards, top-ups, webhooks) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | card flows → `Payments unavailable` |
| S3 / R2 / MinIO uploads | `S3_*` | upload endpoints → `Storage unavailable` |
| FCM HTTP v1 push (`fcm.provider.ts`) | `FCM_SERVICE_ACCOUNT_JSON` (service-account JSON, one line) | `push()` logs the payload; devices still register |
| Resend email (`mail.provider.ts`) | `RESEND_API_KEY`, `MAIL_FROM`, `WEB_APP_URL` | OTP / reset link logged in non-production; warning only in production |
| Meilisearch (`search/`) | `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY` | Postgres `ILIKE` fallback (block-aware); `pnpm search:reindex` rebuilds Meilisearch from Postgres |
| LiveKit (`live/`) | `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` (all three or none) | `POST /live/token`, `/live/call-token` → `503` with `details.code = LIVE_UNAVAILABLE` |
| SMS OTP | — | not yet: phone-channel codes are logged outside production |

- Push: one FCM v1 POST per device with `notification` + `data` + Android channel id; tokens reported
  `UNREGISTERED`/`NOT_FOUND` are deleted. OAuth2 access tokens come from `google-auth-library`'s JWT client.
- Search: `GET /search?q=&type=products|users|posts|all&limit=&cursor=` → `{ products, users, posts }` sections
  (`items`, `nextCursor`, `total`) plus a legacy `items`/`pagination` view of products for the older
  `api.catalog.search` client. Blocks (either direction) filter users and posts for signed-in viewers. Product, user
  and post writes call `SearchIndexer` fire-and-forget so an index outage never fails the write.
- Live: hosts get `roomCreate` + `canPublish`; viewers get `canSubscribe` + `canPublishData` (live chat). Call tokens
  require conversation membership and use room `call-<conversationId>`.

## Security

See `docs/plan/SECURITY.md` for the full OWASP ASVS L2 checklist. Quick facts:

- Login lockout: 5 failures → 15 min (`RATE_LIMIT_EXCEEDED`); per-IP throttles on every auth endpoint.
- Refresh rotation with reuse detection; `GET /auth/sessions`, `DELETE /auth/sessions/:id`, `POST /auth/logout-all`.
- Cookie refresh (web) requires `Origin` in `CORS_ORIGINS`; native clients send `X-Client: native` and a body token.
- `AuditLog` table records auth/security events — query it when investigating an account.
- Stripe: `POST /payments/topup-intent`, `POST /payments/order-intent`, webhook `POST /payments/webhooks/stripe`
  (signature over raw body, de-duplicated by event id). Unset `STRIPE_*` → card flows return "Payments unavailable".
- Uploads: `POST /uploads/sign` → signed PUT to S3-compatible storage → `POST /uploads/finalize` sniffs magic bytes.
- MFA (TOTP): `POST /auth/mfa/setup` → `enable {code}` (returns 10 one-time recovery codes) → login answers
  `{ mfaRequired, challengeToken }` → `POST /auth/mfa/verify {challengeToken, code}` mints the session. Mandatory for
  seller/admin (`GET /auth/mfa.requiredForRole`); admins cannot disable. Rotating `MFA_ENCRYPTION_KEY` makes stored
  secrets undecryptable — users must re-enrol.
- Rotating `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` invalidates every session (intended). Production boot refuses
  placeholder secrets, identical secrets, and wildcard/localhost CORS origins.

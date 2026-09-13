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
src/modules/catalog       products, categories, search, sort/filter
src/modules/cart          server cart, coupons, pricing (shared with checkout)
src/modules/orders        checkout fan-out per seller, escrow state machine, idempotency, auto-release cron
src/modules/wallet        balances + double-entry style transactions
src/modules/feed          posts/loops/stories, likes/saves/comments, blocked-author filtering
src/modules/messaging     conversations + Socket.IO gateway (/realtime)
src/modules/notifications in-app notifications, device (FCM) registration
src/modules/account       Play-policy account deletion (soft, 30-day purge), data export, addresses
src/modules/moderation    reports, block/unblock, admin review queue
```

## Conventions

- Controllers return plain data; `EnvelopeInterceptor` wraps it as `{ success: true, data }`. Use `raw()` to bypass.
- Throw `ApiException`/helpers from `common/errors.ts`; the filter renders `{ success:false, error:{ code, message, details } }`.
- Native clients send `X-Client: native` and receive the refresh token in the body; web gets an httpOnly cookie.
- Payment/checkout endpoints accept `Idempotency-Key`.
- Tests: `pnpm test` (vitest; migrates + seeds `ezyify_test`, then unit + e2e through the real Fastify stack).

# Ezyify Security — OWASP ASVS 4.0 Level 2 checklist

Living document for Phase 6. Each row names the control, where it lives, and how it is verified. ☑ = implemented and
tested, ◐ = implemented, verification pending, ☐ = planned. Re-audit before every production release.

## V1 Architecture

| # | Control | Where | Status |
|---|---------|-------|--------|
| 1.2 | Single authentication path shared by web + native (`AuthModule`); no per-client shortcuts | `apps/api/src/modules/auth` | ☑ |
| 1.4 | One access-control enforcement point (`AuthGuard` as `APP_GUARD`), ownership checks inside services | `auth.guard.ts`, `orders.service.ts#transition` | ☑ |
| 1.5 | Wire contract = `@ezyify/core` zod schemas, validated on the way in (`ZodPipe`) and out (client `envelope()` parse) | `packages/core/src/schemas`, `common/zod.pipe.ts` | ☑ |
| 1.6 | Secrets only via environment; `loadEnv` refuses placeholder / shared / weak secrets in production | `apps/api/src/config.ts` (+ `config.security.spec.ts`) | ☑ |
| 1.14 | Frontends deployed on separate origins; API strict CORS allow-list, credentials only for listed origins | `bootstrap.ts` | ☑ |

## V2 Authentication

| # | Control | Where | Status |
|---|---------|-------|--------|
| 2.1.1 | Passwords ≥ 8 chars with upper/lower/digit (`PasswordSchema`), max 128 enforced by zod | `core/schemas/auth.ts` | ☑ |
| 2.2.1 | Anti-automation: per-IP throttle (login 10/min, signup 5/min, OTP 10/min, forgot 3/min) **and** per-account lockout (5 failures → 15 min) | `auth.controller.ts`, `auth.service.ts#login` | ☑ e2e |
| 2.2.2 | Timing-uniform login (dummy argon2 verify when the account does not exist); generic error message | `auth.service.ts#login` | ☑ |
| 2.4 | Argon2id, m=19 MiB, t=2, p=1 (OWASP 2025 minimums) | `auth.service.ts#ARGON` | ☑ |
| 2.5 | Forgot-password never reveals account existence; reset tokens are 192-bit random, single-use, 10 min TTL, sha256 at rest; reset revokes all sessions | `auth.service.ts#forgotPassword/resetPassword` | ☑ |
| 2.7 | OTP: 6 digits, 10 min TTL, 5 attempts then new code required, previous codes invalidated on reissue | `auth.service.ts#issueOtp/verifyOtp` | ☑ e2e |
| 2.8 | MFA (TOTP / passkeys) for sellers & admins | — | ☐ Phase 8 |
| 2.10 | Service-to-service secrets (Stripe, FCM, S3) via env only, never in repo (`.env*` ignored, `.example` committed) | `.gitignore`, `.env.example` | ☑ |

## V3 Session management

| # | Control | Where | Status |
|---|---------|-------|--------|
| 3.2 | Access JWT 15 min (HS256, dedicated secret); refresh 7 days, 384-bit random, stored as sha256 | `auth.service.ts` | ☑ |
| 3.3 | Refresh **rotation** on every use; presenting an already-rotated token revokes the entire chain (theft detection) and is audited | `auth.service.ts#refresh` | ☑ e2e |
| 3.3.4 | Users can list active device sessions and revoke any of them, or log out everywhere | `GET/DELETE /auth/sessions`, `POST /auth/logout-all` | ☑ e2e |
| 3.4 | Web refresh cookie: `HttpOnly`, `Secure` (prod), `SameSite=Lax`, path `/`, 7 d; access token kept in memory only | `auth.controller.ts#setCookie`, `apps/web/src/app/runtime.ts` | ☑ e2e |
| 3.5 | Native: refresh token in Android Keystore via `expo-secure-store`, sent in body with `X-Client: native`; never in AsyncStorage on device | `apps/mobile/src/lib/runtime.ts` | ☑ |
| 3.7 | Re-authentication (password) required for account deletion; biometrics gate wallet pay & deletion on device | `account.controller.ts`, mobile `useBiometricGate` | ☑ |

## V4 Access control

| # | Control | Where | Status |
|---|---------|-------|--------|
| 4.1 | Deny by default: every route requires a valid bearer unless `@Public()`; role hierarchy user < creator < seller < admin < superadmin via `@Roles()` | `auth.guard.ts` | ☑ e2e |
| 4.1.3 | Row-level ownership: orders (buyer/seller/admin), cart, wallet, addresses, sessions, uploads (key prefix = user), messages (participant check) | services | ☑ e2e |
| 4.2.1 | State machine forbids illegal order transitions and wrong actors (buyer can't ship, seller can't confirm delivery) | `orders/escrow.ts` | ☑ unit + e2e |
| 4.2.2 | CSRF: cookie refresh requires `Origin`/`Referer` in the CORS allow-list; `SameSite=Lax`; all mutating endpoints are bearer-auth (not cookie) | `auth.controller.ts#assertSameOrigin` | ☑ e2e |
| 4.3 | Admin surfaces (`/admin/*`) role-gated and audited | `moderation.controller.ts` | ☑ e2e |

## V5 Validation, sanitisation, encoding

| # | Control | Where | Status |
|---|---------|-------|--------|
| 5.1 | Every body/query parsed by zod with allow-lists (enums, lengths, regexes); unknown keys stripped | `common/zod.pipe.ts` | ☑ e2e |
| 5.1.4 | Pagination bounded 1–100; IDs URL-encoded by the client | `common/pagination.ts`, `core/api/endpoints.ts` | ☑ |
| 5.2 | User text is stored raw and rendered by React (auto-escaped); no `dangerouslySetInnerHTML` with user data on web | `apps/web` | ◐ lint rule pending |
| 5.3.4 | Parameterised queries only (Prisma); no raw SQL with interpolation (`$queryRaw` used once with a constant) | `apps/api` | ☑ |
| 5.5 | JSON body limit 2 MiB (413 beyond) | `bootstrap.ts` | ☑ e2e |

## V6 Cryptography

| # | Control | Where | Status |
|---|---------|-------|--------|
| 6.2 | `node:crypto` CSPRNG for tokens/OTP (`randomBytes`, `randomInt`); sha256 for token digests; argon2id for passwords | `auth.service.ts` | ☑ |
| 6.4 | Secrets rotation procedure: change `JWT_*_SECRET` → all sessions invalid; documented in `apps/api/README.md` | — | ◐ |

## V7 Error handling & logging

| # | Control | Where | Status |
|---|---------|-------|--------|
| 7.1 | Structured pino logs; `authorization`, `cookie`, `set-cookie` redacted; no stack traces to clients (generic 500) | `app.module.ts`, `http-exception.filter.ts` | ☑ |
| 7.2 | Audit log (`AuditLog`): login, failed login, lockout, refresh reuse, session revoke, password reset, account delete/export, admin report review, webhook accept/reject | `common/audit.service.ts` | ☑ e2e |
| 7.4 | Errors normalised to `{ success:false, error:{ code, message, details } }`; validation details are field-level only | `http-exception.filter.ts` | ☑ e2e |

## V8 Data protection & privacy

| # | Control | Where | Status |
|---|---------|-------|--------|
| 8.3.2 | Users can export their data (`POST /account/export`, 3/hour) | `account.controller.ts` | ☑ |
| 8.3.4 | Users can delete their account in-app; soft delete → sessions/devices revoked immediately → hard purge after 30 days (cron); restorable for 14 days | `account.controller.ts`, `orders.service.ts#housekeeping` | ☑ |
| 8.3.5 | Data-safety mapping for Play Console (collected: email, name, phone(opt), photos (UGC), purchase history, device token; shared: payment processor) | `docs/plan/PLAY_STORE_CHECKLIST.md` | ☑ |
| 8.3.7 | Money never as floats — integer minor units end to end | `core/schemas/common.ts#MoneySchema` | ☑ |
| 8.3.8 | Cookie/consent preferences on web: analytics/marketing **off by default**, GPC/DNT honoured as opt-out, PostHog only loads after consent, Sentry sends no PII without it; banner + `/privacy-preferences` | `apps/web/src/app/lib/consent.ts`, `lib/telemetry.ts`, `components/CookieConsent.tsx` | ☑ unit + e2e |

## V9 Communications

| # | Control | Where | Status |
|---|---------|-------|--------|
| 9.1 | TLS-only in production: HSTS 2 years + preload; `Secure` cookies; Android `usesCleartextTraffic=false` (Expo default), no `network_security_config` exceptions | `bootstrap.ts`, `app.config.ts` | ☑ |
| 9.2 | Certificate pinning on Android — optional; documented trade-off (breaks on cert rotation; Play App Signing unaffected) | `docs/plan/ANDROID_RELEASE.md` | ☐ opt-in |

## V10 Malicious code / supply chain

| # | Control | Where | Status |
|---|---------|-------|--------|
| 10.3 | `pnpm audit --prod` gate in CI (fails on high/critical); overrides pin patched transitive versions | `.github/workflows/security.yml`, root `package.json#pnpm.overrides` | ☑ |
| 10.3 | Renovate: weekly grouped minor/patch updates, lockfile maintenance, security PRs immediately | `renovate.json` | ☑ |
| 10.3 | CodeQL (JavaScript/TypeScript) on PRs + weekly | `.github/workflows/security.yml` | ☑ |
| 10.3 | pnpm `onlyBuiltDependencies` allow-list — no arbitrary postinstall scripts | root `package.json` | ☑ |
| 10.3 | Lockfile committed; CI uses `--frozen-lockfile` | `ci.yml` | ☑ |

## V11 Business logic

| # | Control | Where | Status |
|---|---------|-------|--------|
| 11.1.4 | Idempotency keys on checkout, wallet debit/credit and Stripe intent creation → safe retries, no double charge | `orders.service.ts`, `wallet.service.ts`, `payments.service.ts` | ☑ e2e |
| 11.1.5 | Escrow ledger records hold / release / refund / commission; wallet mutations happen inside the same DB transaction as the order transition | `orders.service.ts#transition` | ☑ e2e |
| 11.1.6 | Stock checked at cart-add and again at checkout inside the transaction | `cart.service.ts`, `orders.service.ts#checkout` | ☑ |
| 11.1.7 | Report spam limited to one report per target per reporter per 24 h; OTP/forgot throttled | `moderation.controller.ts` | ☑ |

## V12 Files & resources

| # | Control | Where | Status |
|---|---------|-------|--------|
| 12.1 | Size limits per type (images 12 MiB, video 250 MiB) enforced at sign time and re-checked at finalize | `uploads.controller.ts` | ☑ e2e |
| 12.2 | Allow-listed MIME types; **magic-byte sniffing** (`file-type`) of the stored object at finalize; mismatches deleted | `uploads.service.ts#finalize` | ☑ |
| 12.3 | Server-generated object keys (`u/{user}/{purpose}/{uuid}.{ext}`) — no user-supplied paths; finalize checks key prefix = caller | `uploads.controller.ts` | ☑ |
| 12.4 | Direct-to-bucket signed PUT (5 min); API never proxies bytes; bucket must serve `Content-Disposition`/`X-Content-Type-Options` via CDN | infra note | ◐ |
| 12.6 | No SSRF surface: server never fetches user-supplied URLs | — | ☑ |

## V13 API & web services

| # | Control | Where | Status |
|---|---------|-------|--------|
| 13.1 | JSON only; `Content-Type` enforced by Fastify; 422 on schema failure | `bootstrap.ts` | ☑ |
| 13.2.3 | Stripe webhook: signature verified over the raw body (`rawBody: true`), events de-duplicated by id (`WebhookEvent`), rejected attempts audited | `payments.service.ts#handleWebhook` | ☑ e2e |
| 13.2.5 | Rate limiting: 100 req/min/IP default, tighter per endpoint, 429 with spec code | `app.module.ts` | ☑ |
| 13.4 | OpenAPI generated from code, Swagger UI **disabled in production** | `bootstrap.ts` | ☑ |

## V14 Configuration

| # | Control | Where | Status |
|---|---------|-------|--------|
| 14.2 | Dependencies pinned via lockfile; latest stable majors (NestJS 12, Prisma 7, Expo 57, Vite 6/8) | `pnpm-lock.yaml` | ☑ |
| 14.4.w | Web origin: CSP `default-src 'self'; script-src 'self'` (no inline scripts — theme bootstrap is `/theme-init.js`), `object-src 'none'`, `frame-ancestors 'none'`, HSTS preload, `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` — emitted as `<meta>` in the build and as `_headers` for Cloudflare Pages/Netlify | `apps/web/vite/seo.ts` | ☑ e2e |
| 14.4 | Helmet: `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors 'none'`, `Referrer-Policy: no-referrer`, CSP `default-src 'none'` (prod), no `X-Powered-By`, `Cross-Origin-Resource-Policy` | `bootstrap.ts` | ☑ e2e |
| 14.5 | CORS: explicit origins, credentials, allowed headers `Authorization, Content-Type, Idempotency-Key, X-Client` | `bootstrap.ts` | ☑ |
| 14.5.2 | Production refuses `*`/localhost origins and placeholder secrets at boot | `config.ts` | ☑ unit |
| — | Android release: R8/ProGuard + resource shrinking on, `debuggable=false`, release-signed only, 16 KB gate in CI | `app.config.ts`, `android-release.yml` | ☑ |

## Threat model highlights

- **Token theft on device** → refresh token in Keystore, 7-day expiry, rotation + reuse detection, user-visible session list with revoke.
- **XSS on web** → access token in memory only (never `localStorage`), refresh in `HttpOnly` cookie, React escaping, web CSP (`script-src 'self'`, no inline) shipped in Phase 8.5.
- **CSRF** → refresh is the only cookie-authenticated endpoint; `SameSite=Lax` + Origin allow-list; everything else is bearer.
- **Payment tampering** → prices come from the DB at checkout, never the client; wallet and escrow move in one transaction; webhooks signed + idempotent.
- **Account enumeration** → identical responses/timing for unknown accounts on login/forgot.
- **Abuse** → per-IP throttles, per-account lockout, report/block, admin queue with audit trail.

## Operational runbook

- Rotate `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`: deploy new values → all users re-authenticate (expected). Rotate Stripe webhook secret in the Stripe dashboard and env together.
- Suspected token theft for a user: `POST /auth/logout-all` as the user, or `UPDATE "RefreshSession" SET "revokedAt"=now() WHERE "userId"=…`; audit rows `auth.refresh_reuse` show the source IP/UA.
- Dependency alert: Renovate opens a PR; `pnpm audit --prod` in CI blocks merges on high/critical until the override or bump lands.

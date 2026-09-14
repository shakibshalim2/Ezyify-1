# Ezyify — Master Delivery Plan

> Single source of truth for turning the Figma Make export into a production
> social‑commerce product shipped on **Web** and **Google Play (signed AAB/APK)**.
> Status legend: ☐ todo · ◐ in progress · ☑ done · ✗ dropped

Last updated: 2026‑09‑14

---

## 0. Ground rules

| Rule | Detail |
|---|---|
| Branch | Phases 0–7 shipped from `hoplite/praisos-5d6d32fd` (PR #1, PR #2 → `main`). Phase 8 continues on `hoplite/thespiai-de0dfed9`; each finished step is a separate commit + push, one PR to `main`. |
| Definition of done (per step) | code → `pnpm typecheck` + `pnpm lint` + `pnpm test` green → build passes → visual check in preview → commit → push. |
| Mobile build | **Standalone signed release** (`.aab` for Play Store + `.apk` for sideload) produced by Gradle/EAS `--local`. **Expo Go is never required** to run the app; the dev client is optional for developers only. Same model as a Flutter signed build. |
| No secrets in repo | Keystore, API keys, `.env*` are git‑ignored. Signing config reads from `~/.gradle/gradle.properties` or CI secrets. |
| Design first | Phase 1 (design system + first‑run experience) ships before backend wiring so the app looks finished while the API is built. |

---

## 1. Tech stack (decided)

| Layer | Choice | Notes |
|---|---|---|
| Monorepo | pnpm workspaces + Turborepo | `apps/web`, `apps/mobile`, `apps/api`, `packages/core`, `packages/ui-tokens`, `packages/config` |
| Web | Vite 6 · React 18 · TypeScript · React Router 7 · Tailwind v4 · shadcn/Radix · `motion` · TanStack Query · Zustand · react‑hook‑form + zod | Existing code preserved and refactored in place |
| Mobile | **React Native + Expo SDK 52 (prebuild → native Android project)** · Expo Router · NativeWind · Reanimated 3 + Moti · `lottie-react-native` · `expo-splash-screen` · `expo-image` · `expo-video` | Built with `eas build --local` or `./gradlew bundleRelease` → signed `.aab`/`.apk`. No Expo Go. |
| Shared | `packages/core`: zod schemas, API client (fetch + interceptors), TanStack Query hooks, Zustand stores, i18n strings, design tokens JSON | Consumed by web + mobile |
| Backend | NestJS 10 · PostgreSQL 16 (Prisma) · Redis 7 · BullMQ · Socket.IO gateway | OpenAPI spec already exists in `src/app/docs/openapi-spec.json` |
| Auth | Email/phone + OTP, JWT access (15 min, memory) + rotating refresh (httpOnly cookie on web / SecureStore on mobile), Google & Apple sign‑in, optional biometrics (expo-local-authentication) | Matches `BACKEND_API_SPECIFICATION.md` |
| Payments / escrow | Stripe Connect (default) — adapter interface so bKash/Nagad/SSLCommerz/Razorpay can be added; escrow ledger table in Postgres with double‑entry postings | Physical goods → 3rd‑party processor (Play policy compliant) |
| Media | S3‑compatible storage (Cloudflare R2) · Mux for video (Loops/Live) · image CDN transforms | |
| Realtime | Socket.IO (chat, notifications, live comments) · LiveKit for live video + calls | |
| Search | Meilisearch | products, users, posts |
| Observability | Sentry (web/mobile/api) · OpenTelemetry → Grafana · structured pino logs | |
| CI/CD | GitHub Actions: lint/type/test/build on PR · web deploy (Vercel/Cloudflare Pages) · API deploy (Docker → Fly.io/Railway) · Android release workflow (signed AAB → Play internal track) | |

---

## 2. Repository layout (target)

```
ezyify/
├─ apps/
│  ├─ web/          # current Vite app (moved from repo root)
│  ├─ mobile/       # Expo (prebuilt android/ committed after step 4.1)
│  └─ api/          # NestJS
├─ packages/
│  ├─ core/         # schemas, api client, hooks, stores, i18n
│  ├─ tokens/       # design tokens (JSON → CSS vars + RN theme)
│  └─ config/       # eslint, tsconfig, prettier presets
├─ docs/
│  ├─ plan/         # this file + phase checklists
│  ├─ audit/        # design audits
│  ├─ research/     # research briefs
│  └─ (existing product docs move here from src/app/docs)
├─ .github/workflows/
├─ turbo.json  pnpm-workspace.yaml  package.json
```

Migration is incremental: Phase 1 works inside the current layout; Phase 2 performs the move in one commit with path aliases kept stable (`@/`).

---

## 3. Phases & checklist

### Phase 0 — Foundation & hygiene (day 1)
- ☑ Research + audits committed (`docs/research`, `docs/audit`)
- ☑ Master plan (this doc)
- ☑ `tsconfig.json` (strict), ESLint 9 flat config, Prettier, Vitest + Testing Library (312 TS errors → 0)
- ☑ Remove Figma quirks: `process.env.NODE_ENV=production` define, `figma:asset` alias → real imports, duplicate `pkg@version` deps, unused MUI/Emotion/react-slick/react-dnd/etc.
- ☑ `.gitignore`, `.env.example`, `.nvmrc`, `pnpm-lock.yaml` committed
- ☑ Route‑level dead code: 24 launch/QA dashboards gated behind `import.meta.env.DEV` (`routes/devRoutes.tsx`, a5c9476)
- ☑ GitHub Actions: `ci.yml` (install → lint → typecheck → test → build)
- ☑ Playwright E2E skeleton (882371d) → full journeys in Phase 7

### Phase 1 — Design system + first‑run experience (P0 design)
Source: `docs/audit/DESIGN_ISSUES_BY_SEVERITY.md`, `docs/research/EZYIFY_DESIGN_RESEARCH_BRIEF.md`

1.1 **Design tokens** ☑ (`src/styles/tokens.css`)
- Brand: Ezyify Blue `#0B5FD6` (from logo) + Signal Orange `#F26A1B` (logo dot) as accent; keep purple only in gradients. Full 50–950 ramps, semantic tokens (surface/elevated/overlay, text primary/secondary/tertiary, border, success/warning/error/info), dark‑first with light parity.
- Typography: **Plus Jakarta Sans** (display/headings) + **Inter** (body/UI), self‑hosted via `@fontsource-variable`. Scale 12/14/16/18/20/24/30/36.
- Spacing 4‑pt base / 8‑pt grid, radius scale (8/12/16/24/full), elevation tokens for dark mode (tonal surfaces not shadows), motion tokens (durations 100/200/300/500, easings emphasized/standard).
- Emit: `src/styles/tokens.css` (+ `@theme` mapping for Tailwind v4) and `packages/tokens/tokens.json` for RN.

1.2 **Primitive components** ☑ — Button, Field, OTPInput, SocialButton, PasswordStrength, BrandMark, Card (4 variants), Skeleton (shimmer), EmptyState (9 brand illustrations), PageTransition — `Button` (variants, sizes, loading, icon), `Input`/`Field` (label association, error/success state, helper, password toggle, phone with country code), `OTPInput` (6 boxes ≥48px, auto‑advance, paste, shake on error), `SocialButton` (Google/Apple/Facebook proper icons), `Card` (default/elevated/featured/ghost), `Skeleton` (shimmer), `EmptyState` (illustration slot), `Sheet` (slide + fade), `PageTransition` wrapper.

1.3 **Splash screen** ◐ — web done (`features/splash`); Android config in Phase 4 — Web: animated logo mark (SVG rebuilt from PNG, morph/scale + brand gradient sweep, ≤1.2 s, respects `prefers-reduced-motion`), shown only on cold start. Android: `expo-splash-screen` config, 288 dp icon on `#0B5FD6`, dark variant.

1.4 **Onboarding** ☑ — 3‑slide carousel (`/welcome`) + post‑signup setup (Interests → Creators → Permissions) on shared `SetupLayout` with step progress and real browser permission prompts — 3 slides (Discover · Shop with Escrow protection · Go Live & Earn) with custom SVG/Lottie illustrations in brand palette, swipe + dots + Skip, progress indicator, "Get started" → Signup, "I have an account" → Login. Stored `onboarding_seen` flag. Persona pick + interests follow after signup (existing `InterestsPage`/`FollowSuggestionsPage` re‑skinned).

1.5 **Auth screens** ☑ — Login (email/phone), Signup, OTP, Forgot, Reset redesigned with shared `AuthLayout` — Login (email/phone tab, password, biometrics prompt on mobile, social top row), Signup (name → email/phone → password with live rule checklist and strength meter → terms), OTP (auto‑read on Android via `expo-sms-retriever` later; resend countdown; error shake), Forgot/Reset. Motion: staggered field entrance (60 ms), focus glow, button press scale 0.98, success check Lottie.

1.6 **Global shell** ☑ — `BottomNav` (64 px + safe area, spring pill, raised Create), theme‑aware landing `Navbar`, `pb-nav` shell padding, route `PageTransition` — Bottom nav (5 items, 64 px, safe‑area, active pill indicator, center Create FAB), top bar, `pb-nav` padding utility applied to all scrollable pages, theme‑aware `Navbar` on Landing, mobile search entry.

1.7 **Illustrations & imagery** ☐ — unDraw SVGs recolored to brand (onboarding ×3, empty states ×6: feed, cart, wishlist, orders, messages, notifications, search‑no‑results, offline, error), Lottie: success check, loading loop, confetti (LottieFiles free license). Product/avatar placeholders switched to a deterministic image service with local fallback. Attributions in `ATTRIBUTIONS.md`.

### Phase 2 — Main app design pass (P1 design) — ✅ complete (PR #1, PR #2)
Ordered by audit score: Home hero + feed cards → Loops viewer transitions & action rail → Stories progress/gestures → Product detail (gallery zoom, sticky CTA) → Cart (swipe‑to‑remove, seller grouping) → Shop/Categories → Search → Profile (cover gradient, stats) → Messages (typing indicator, bubbles) → Live (player chrome) → Wallet/Orders/Checkout → Seller & Creator dashboards → Settings/Help/Legal. Each screen: hierarchy, card variant, empty/loading/error state, motion, a11y labels.

### Phase 3 — Monorepo + shared core
- ☑ Move web to `apps/web`; create `packages/core`, `packages/tokens`, `packages/config`; Turborepo pipelines
- ☑ API client with zod‑validated responses, auth interceptor (silent refresh), bounded retry/backoff, timeout
- ☑ `@ezyify/tokens`: `tokens.json` → generated `tokens.css` (web) + `nativeTheme()` (RN); web imports the generated CSS
- ☑ `@ezyify/core` runtime (auth + guest‑cart stores, endpoint map, react‑query client) mounted in `App.tsx`
- ◐ Migrate screens from local mock data to `useApi()` → **Phase 8.1–8.4**

### Phase 4 — Mobile app (Expo, standalone signed builds)
- 4.1 ☑ `apps/mobile` via `create-expo-app` (**SDK 57**, RN 0.86, React 19.2, Expo Router 57, React Compiler), Reanimated 4, expo-image, SecureStore, Inter/Plus Jakarta fonts; theme from `@ezyify/tokens`, runtime from `@ezyify/core`. NativeWind skipped (v5 still RC; styles use the token theme directly)
- 4.2 ☑ `expo prebuild --platform android` → `android/` committed (so `./gradlew` builds work without EAS cloud)
- 4.3 ☑ Signing: `plugins/withReleaseSigning.js` injects `signingConfigs.release` (keystore.properties or `EZYIFY_UPLOAD_*` env) on every prebuild; R8 + resource shrinking via `expo-build-properties`; `scripts/bump-version-code.mjs`. ☐ Play App Signing enrolment (user, at first upload)
- 4.4 ☑ Build recipes documented (`docs/plan/ANDROID_RELEASE.md`): `./gradlew :app:bundleRelease` → `.aab`; `./gradlew :app:assembleRelease` → `.apk`; optional `eas build --local --profile production`
- 4.5 ☑ Screens ported from web design: Splash → Welcome carousel → Auth (Login/Signup/OTP/Forgot) → Interests/Follow → Tabs (Home feed + stories, Explore grid, Create composer, Shop, Profile) → Loops viewer → Story viewer → Post detail + comments → Product detail (gallery, variants, sticky CTA) → Cart → Checkout → Order success → Orders → Wallet → Messages + chat → Notifications → Deals → Settings. Mock data in `@ezyify/core` shapes; wired to `useApi()` in Phase 5.
- 4.6 ☑ Native concerns: App Links (`ezyify.app` + `www`, `assetlinks.json` served from web, `lib/links.ts` maps web paths → routes, notification taps route via payload URL), push (expo-notifications + FCM, 5 channels, contextual opt-in after first order / Settings — never at launch, `POST /devices` registration), camera + Android Photo Picker (`expo-image-picker`, no READ_MEDIA_*), biometrics (`expo-local-authentication` gating wallet pay + account deletion), target/compile SDK 36, buildTools 36, 16 KB alignment check in release CI
- 4.7 ☑ Play Store: `docs/plan/PLAY_STORE_CHECKLIST.md` (target API 36 deadline, 16 KB, permissions justification, Data safety table, financial-features declaration, content rating), in-app account deletion (`settings/delete-account`) + web URL, UGC report (`/report`) + block from every post/profile, ToS/Privacy links, `store/` icon-512 + feature graphic. ☐ Screenshots from a real device, ☐ CSAE standards page, ☐ Play App Signing SHA-256 into `assetlinks.json` (user, at first upload)
- 4.8 ◐ GitHub Action `android-release.yml`: keystore + `GOOGLE_SERVICES_JSON` secrets, `expo prebuild` regeneration, 16 KB `.so` alignment gate, signed `.aab`/`.apk` artifacts. ☐ Auto-upload to Internal testing track (needs Play service-account JSON from user)

### Phase 5 — Backend (NestJS) — ✅ core delivered (PR #2)
- ☑ `apps/api`: NestJS 12 + Fastify 5 + Prisma 7 (`prisma-client` ESM generator, `@prisma/adapter-pg`) + PostgreSQL 16. Schema: users/roles, refresh sessions, OTP, devices, addresses, categories/products/variants/reviews, cart, orders + items + events + escrow ledger + refund requests, wallets/transactions, posts/media/product tags, comments/likes/saves, follows/blocks, conversations/participants/messages, notifications, reports, idempotency keys
- ☑ Modules: auth (argon2id, JWT 15 min + rotating 7-day refresh with reuse detection, OTP verify/reset, cookie for web / body for `X-Client: native`), users (profiles, follow, block-aware), catalog (list/sort/filter/search, detail, categories), cart (server cart, coupons, shared pricing), orders (per-seller fan-out, wallet debit, `Idempotency-Key`, escrow state machine `held → released | refunded | disputed`, hourly auto-release cron, 5 % platform fee on release), wallet (balances, top-up, withdraw, double-entry style ledger), feed (posts/loops/stories, like/save/comment, blocked-author filtering), messaging (REST + Socket.IO `/realtime` gateway with JWT handshake, typing), notifications (list/read, `POST/DELETE /devices` for FCM), account (Play-policy soft deletion + 30-day purge, restore, data export, addresses), moderation (reports, block/unblock, admin review queue), health (`/health`, `/health/ready`)
- ☑ Cross-cutting: zod-validated env (fails fast), request validation with the **same `@ezyify/core` schemas the clients use**, spec error envelope + codes, rate limiting (100/min, tighter on auth), Helmet, strict CORS, pino logging with secret redaction, Swagger UI at `/v1/docs` + `openapi.json`
- ☑ Seed fixtures mirroring the mobile mock data; vitest unit + e2e (25 tests through the real Fastify stack: auth rotation/reuse, contract-validated responses, checkout → escrow → release with fee, RBAC, blocking, reports); CI runs against a Postgres 16 service
- ☑ Stripe adapter + webhooks (Phase 6) · ☐ LiveKit tokens, FCM v1 send, Meilisearch — Phase 8
- ◐ Migrate web + mobile screens from mock data to `useApi()` → **Phase 8.1–8.4**

### Phase 6 — Security — ✅ delivered (PR #2)
- ☑ OWASP ASVS L2 checklist with control → code → verification mapping in `docs/plan/SECURITY.md` (+ threat model, ops runbook)
- ☑ Argon2id (already), **account lockout** (5 failures → 15 min), OTP attempt cap, refresh rotation + reuse detection (already), **device sessions list / revoke / logout-all**, `AuditLog` table + `AuditService` (login, failures, lockout, reuse, revoke, reset, delete/export, admin review, webhooks)
- ☑ Helmet hardened (CSP `default-src 'none'` + HSTS preload in prod, `Referrer-Policy: no-referrer`, CORP), strict CORS, **CSRF Origin check** on the cookie refresh flow, zod validation everywhere, 2 MiB body limit, Swagger off in production
- ☑ RBAC hierarchy + row-level ownership (already) · **Stripe adapter**: top-up & order PaymentIntents with idempotency keys, **webhook signature verification over raw body + event-id de-duplication** (`WebhookEvent`), card orders `pending_payment → paid/cancelled` via webhook
- ☑ **Uploads**: allow-listed MIME + size, server-generated keys, 5-min signed PUT to S3/R2/MinIO, **magic-byte sniffing** at finalize (`file-type`), mismatches deleted
- ☑ Production env guardrails (placeholder/identical secrets, wildcard/localhost CORS rejected at boot) · `pnpm audit --prod` clean via `pnpm.overrides` + CI gate (high/critical) · **Renovate** (grouped weekly, security PRs immediate, Expo SDK excluded) · **CodeQL** security-extended · **gitleaks** secret scan
- ☑ Android: `usesCleartextTraffic=false`, R8 + resource shrinking (already), extra ProGuard rules, `allowBackup=false` (already), SecureStore tokens (already); certificate pinning documented as opt-in
- ☑ Privacy: account deletion + export (already, now audited + export throttled 3/h); Data-safety mapping in Play checklist
- ☐ MFA (TOTP/passkeys) for sellers/admins, web CSP + cookie consent — Phase 8
- Tests: api 36 (unit 12 + e2e 24) incl. lockout, session revoke, CSRF, headers, 413, webhook idempotency, upload allow-list

### Phase 7 — Testing — ✅ delivered (PR #2) · see `docs/plan/TESTING.md`
- ☑ Unit: Vitest with **coverage gates** — `packages/core` ≥ 70 % (now ~96 %, 36 tests incl. auth/cart stores, endpoint map, hooks), `apps/api` ≥ 70 % (now ~87 % lines, 47 tests: 12 unit + 35 e2e through the real Fastify stack)
- ☑ Component: Testing Library + **vitest-axe** on every web primitive (Button, Field, OTPInput, PasswordStrength, Card, EmptyState, Skeleton, SocialButton, BrandMark) — zero WCAG 2.2 A/AA violations; token-level **contrast guardrail tests** (every fg/bg pair ≥ 4.5:1 in both themes)
- ☑ E2E web: Playwright journeys — sign-in + validation, browse → product → cart → 3-step checkout → orders, chat send, first-run, smoke of all routes — on Pixel 7 + Desktop Chrome; **@axe-core/playwright** on `/`, `/shop`, `/login`, `/cart` with zero serious/critical
- ☑ E2E mobile: **Maestro** flows on the release APK (first run → onboarding → login → home; shop → product → cart) with `testID` hooks
- ☑ API: contract tests assert responses against the shared zod schemas; **k6** smoke (`test/load/smoke.js`, p95 budgets on feed/products)
- ☑ Visual: Playwright screenshot baselines for 6 screens × 2 viewports (non-blocking CI step); **Lighthouse CI** budget perf ≥ 90 / a11y ≥ 95 (measured 93–99 / 98–100) as a CI job
- Fixes surfaced by the new tests: dark-theme primary/on-primary, tertiary text, error and accent badge contrast (all below AA), unlabeled carousel dots (+ 24 px targets), unlabeled sort `<select>`, unnamed add-to-cart button, opacity-diluted secondary text

### Phase 8 — Real API wiring, web hardening & launch — ◐ in progress (this branch)
Goal: no screen renders mock data in a release build; the signed APK talks to `apps/api`, and the web app is launch‑ready (SEO/PWA/observability). Every sub‑step = commit + push after `pnpm check` is green.

- 8.1 ☑ **Core** — extend the endpoint map to the full API surface (stories, comments, save, create post, profile update, followers/following, start conversation, unread count, addresses, sessions, cancel order, uploads); `createApiClient` gains static `headers` (mobile sends `X-Client: native`) and `SessionSchema` carries the optional `refreshToken` the API returns to native clients; TanStack Query hooks (`useProducts`, `useProduct`, `useFeed`, `useStories`, `useServerCart`, `useOrders`, `useWallet`, `useConversations`, `useNotifications`, …) with stable `queryKeys`; unit tests for every new endpoint + hook (coverage gate stays ≥ 70 %).
- 8.2 ☑ **Mobile auth on the real API** — Login / Signup / OTP / Forgot call `api.auth.*`; refresh token persisted in SecureStore and rotated through `X-Client: native` (fixes the silent logout after first refresh); logout revokes the session server‑side; `me` hydrated from `/users/me` on cold start; guest cart merged into the server cart on login. Field‑level API errors mapped onto the forms.
- 8.3 ☐ **Mobile data screens on `useApi()`** — Home feed + stories, Explore, Shop/Deals/Categories, Product, Cart, Checkout (real addresses + wallet/card), Order success/Orders, Wallet, Messages + chat, Notifications, Profile (+ follow/block), Post detail + comments, Loops, Story viewer, Create (post/loop/story via signed uploads). Each screen gets loading skeleton, error + retry, and empty state. `lib/mock.ts` deleted. **Demo mode**: `EXPO_PUBLIC_API_MODE=mock` swaps the client `fetch` for an in‑process mock server built from the same seed fixtures, so Maestro/QA builds run without a backend while release builds never bundle mock screens.
- 8.4 ☐ **Web auth + data on core** — `AuthContext` becomes a thin adapter over the core auth store (real `/auth/*`, httpOnly refresh cookie); MSW handlers regenerated for the core endpoint map (`VITE_ENABLE_MSW` dev‑only); Home/Shop/Product/Cart/Orders/Wallet/Messages read through the shared hooks. Playwright journeys run against MSW in CI and against a real API when `E2E_API_URL` is set.
- 8.5 ☐ **Web launch hardening** — SEO (route meta + OG tags, `sitemap.xml` + `robots.txt` build step, prerender of `/`, `/shop`, `/product/:id` shells), PWA (`vite-plugin-pwa`, PNG icons, offline shell), Sentry (web + mobile + api) behind DSN env, PostHog behind cookie consent (analytics off by default → SECURITY 8.3.8), web CSP via `<meta http-equiv>` + `_headers`.
- 8.6 ☐ **API providers** — FCM v1 push send (service‑account JSON), Resend email for OTP/reset, Meilisearch indexer (products/users/posts) with Postgres fallback, LiveKit token endpoint for Live/calls.
- 8.7 ☐ **Security follow‑ups** — MFA (TOTP) for seller/admin roles, `no-danger` lint rule on web, secrets‑rotation runbook.
- 8.8 ☐ **Release** — full audit‑item review, regression checklist, `CHANGELOG.md` + release notes, versionCode bump, signed AAB from `android-release.yml` → Play internal track (needs user: Play App Signing enrolment, service‑account JSON, real‑device screenshots, CSAE page).

---

## 4. Design direction (summary)

- **Personality**: confident, energetic, trustworthy. Dark‑first UI with electric blue primary and orange accent used sparingly for "money/action" moments (Buy, Live badge, deals).
- **Layout**: 8‑pt grid, 16 px page gutters, 24 px section spacing, cards radius 16, sheets radius 24, full‑bleed media.
- **Type**: Plus Jakarta Sans 600/700 for headings (tight tracking), Inter 400/500 for body. Min body 14 px mobile.
- **Motion**: emphasized easing `cubic-bezier(0.2, 0, 0, 1)`, 200–300 ms transitions, spring for press/like, all gated by `prefers-reduced-motion`.
- **Imagery**: flat brand‑colored illustrations (unDraw style) + Lottie micro‑animations; photography only for products/UGC.
- **Accessibility**: WCAG 2.2 AA — 4.5:1 text contrast, 44–48 px touch targets, labelled controls, visible focus, reduced‑motion.

---

## 5. Risks & mitigations

| Risk | Mitigation |
|---|---|
| 96 k LOC of generated code with hidden coupling | Typecheck + tests introduced first; refactor screen‑by‑screen, keep routes stable |
| Expo prebuild drift when native deps change | Commit `android/`, document `expo prebuild --clean` procedure, pin SDK |
| Payment/escrow correctness | Ledger as append‑only double entry, idempotency keys, Stripe test‑mode E2E |
| Play policy rejections (UGC, deletion, data safety) | Phase 4.7 checklist done before first upload; internal track first |
| Asset licensing | Only unDraw / LottieFiles Simple License / CC0 / MIT assets; log in `ATTRIBUTIONS.md` |

---

## 6. Progress log

| Date | Step | Commit |
|---|---|---|
| 2026‑09‑13 | Research + audits + master plan | d8e1cf3 |
| 2026‑09‑13 | Phase 0 tooling (tsconfig/eslint/vitest/CI), 312 TS errors fixed, dep cleanup | (step 2) |
| 2026‑09‑13 | Phase 1: brand tokens, primitives, splash, onboarding, auth redesign + 14 unit tests | b3ab500 |
| 2026‑09‑13 | Phase 1 remainder: setup steps re‑skin, BottomNav, Card/Skeleton/EmptyState, page transitions | 32067e6 |
| 2026‑09‑13 | Phase 2a: Design guide; Cart, Checkout, Product detail, Shop, Explore redesigned; Home tokens | 17018ce |
| 2026‑09‑13 | Phase 2b: Home hero, Loops, Stories, Profile, Search, Messages, Notifications redesigned | 72fcb9a (PR #1 merged) |
| 2026‑09‑13 | Dev‑only gating of 24 internal launch/QA dashboards + console banners (`routes/devRoutes.tsx`) | a5c9476 |
| 2026‑09‑13 | Phase 2c: Live viewer, Live Shopping hub, Upload composer (3 steps), Settings + sub‑pages | 48cebc4 |
| 2026‑09‑13 | Phase 2d: Wallet, Orders, Order tracking/success, refunds, returns, disputes, negotiation | 80feb71 |
| 2026‑09‑13 | Phase 2e: Seller Hub shell, all seller pages, creator pages | ff3f12f |
| 2026‑09‑13 | Design review pass: token cleanup, safe storage reads, a11y/deprecation fixes | f98145f |
| 2026‑09‑13 | Playwright smoke suite (mobile + desktop) wired into CI | 882371d |
| 2026‑09‑13 | Phase 2f: Post detail, Storefront, Profile edit/followers, Deals, Categories, Wishlist, Dashboard, Help, Error pages | f77d82c |
| 2026‑09‑13 | Phase 3: monorepo (`apps/web`, `packages/{core,tokens,config}`), Turborepo, typed zod API client + stores, CI on turbo | f30081a |
| 2026‑09‑13 | Phase 4.1–4.4: `apps/mobile` (Expo SDK 57, standalone), committed `android/`, release‑signing plugin, icons/splash, tabs + Home + Product | cc31f79 |
| 2026‑09‑13 | Phase 4.5a: entry gate, onboarding carousel, interests/follow, auth screens, RN primitives | 9588322 |
| 2026‑09‑13 | Phase 4.5b: Home feed, Explore, Shop, Profile, Loops, Stories, Post, Cart/Checkout/Success, Orders, Wallet, Messages, Notifications, Deals, Create, Settings | d082e6f |
| 2026‑09‑13 | Phase 4.6–4.7: App Links + assetlinks, FCM push (contextual opt-in), Photo Picker/camera, biometrics, account deletion, report/block, Play checklist, store assets, 16 KB CI gate | 5b3dafe |
| 2026‑09‑13 | Phase 5: `apps/api` NestJS 12 / Fastify 5 / Prisma 7 backend — auth, users, catalog, cart, orders + escrow, wallet, feed, messaging + WS, notifications, account deletion/export, moderation; seed; 25 e2e tests; CI Postgres | 4a63969 |
| 2026‑09‑14 | Phase 6: ASVS L2 `SECURITY.md`, lockout + audit log + device sessions, CSRF origin check, hardened Helmet, Stripe webhooks (signed + idempotent), signed uploads with MIME sniffing, prod env guardrails, audit/CodeQL/gitleaks CI, Renovate, Android cleartext off | 27ef538 |
| 2026‑09‑14 | Phase 7: coverage gates (core 96 %, api 87 %), vitest-axe primitives, token contrast tests, Playwright journeys + axe + visual baselines, Lighthouse CI, k6 smoke, Maestro flows, `TESTING.md`; AA contrast fixes across dark theme | 9c78e12 |
| 2026‑09‑14 | Security: 7 CodeQL highs, CSPRNG‑only ids, prisma generate race in CI | 09295f4 · 602dbbd · fe38e38 · 4a4ef2b (PR #2 merged) |
| 2026‑09‑14 | Phase 8 plan: real API wiring (core → mobile → web), launch hardening, providers, release | 3e756d7 |
| 2026‑09‑14 | 8.1 Core: full endpoint map (+30 endpoints), `headers` on the client, native `refreshToken`, 40 TanStack Query hooks with optimistic like/save/follow; 47 tests, 98 % lines | a247e72 |
| 2026‑09‑14 | 8.2 Mobile auth on the real API: `@ezyify/core/mock` in‑process mock server + shared fixtures (`EXPO_PUBLIC_API_MODE=mock`), Login/Signup/OTP/Forgot on `api.auth.*`, native refresh‑token rotation in SecureStore, cold‑start `restoreSession`, server‑side sign‑out, account deletion, guest‑cart merge, `QueryState`/`ErrorState` primitives; verified end‑to‑end on the web export | (this commit) |

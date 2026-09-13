# Ezyify — Master Delivery Plan

> Single source of truth for turning the Figma Make export into a production
> social‑commerce product shipped on **Web** and **Google Play (signed AAB/APK)**.
> Status legend: ☐ todo · ◐ in progress · ☑ done · ✗ dropped

Last updated: 2026‑09‑13

---

## 0. Ground rules

| Rule | Detail |
|---|---|
| Branch | All work on `hoplite/praisos-5d6d32fd` (thread branch). One PR to `main`; each finished step is a separate commit + push. |
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
- ☐ Route‑level dead code: move ~25 "launch/validation/QA dashboard" pages + `utils/*Validator*` behind `import.meta.env.DEV` or delete
- ☑ GitHub Actions: `ci.yml` (install → lint → typecheck → test → build)
- ☐ Playwright E2E skeleton

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
- ☐ Migrate screens from local mock data to `useApi()` + MSW handlers that satisfy the core schemas (continues alongside backend work)

### Phase 4 — Mobile app (Expo, standalone signed builds)
- 4.1 ☑ `apps/mobile` via `create-expo-app` (**SDK 57**, RN 0.86, React 19.2, Expo Router 57, React Compiler), Reanimated 4, expo-image, SecureStore, Inter/Plus Jakarta fonts; theme from `@ezyify/tokens`, runtime from `@ezyify/core`. NativeWind skipped (v5 still RC; styles use the token theme directly)
- 4.2 ☑ `expo prebuild --platform android` → `android/` committed (so `./gradlew` builds work without EAS cloud)
- 4.3 ☑ Signing: `plugins/withReleaseSigning.js` injects `signingConfigs.release` (keystore.properties or `EZYIFY_UPLOAD_*` env) on every prebuild; R8 + resource shrinking via `expo-build-properties`; `scripts/bump-version-code.mjs`. ☐ Play App Signing enrolment (user, at first upload)
- 4.4 ☑ Build recipes documented (`docs/plan/ANDROID_RELEASE.md`): `./gradlew :app:bundleRelease` → `.aab`; `./gradlew :app:assembleRelease` → `.apk`; optional `eas build --local --profile production`
- 4.5 ☑ Screens ported from web design: Splash → Welcome carousel → Auth (Login/Signup/OTP/Forgot) → Interests/Follow → Tabs (Home feed + stories, Explore grid, Create composer, Shop, Profile) → Loops viewer → Story viewer → Post detail + comments → Product detail (gallery, variants, sticky CTA) → Cart → Checkout → Order success → Orders → Wallet → Messages + chat → Notifications → Deals → Settings. Mock data in `@ezyify/core` shapes; wired to `useApi()` in Phase 5.
- 4.6 ☐ Native concerns: deep links (`ezyify://`, App Links), push (FCM via expo-notifications), camera/upload, biometrics, 16 KB page‑size compliant deps, target SDK 35/36
- 4.7 ☐ Play Store: data‑safety form, account‑deletion flow (in‑app + web URL), UGC reporting/blocking, content rating, privacy policy URL, store listing assets (icon 512, feature graphic 1024×500, screenshots)
- 4.8 ☐ GitHub Action `android-release.yml` (secrets: keystore base64, passwords) → internal testing track

### Phase 5 — Backend (NestJS)
- ☐ `apps/api` scaffold, Prisma schema from `BACKEND_API_SPECIFICATION.md` (users, roles, products, orders, escrow_ledger, wallets, transactions, refunds, disputes, withdrawals, posts, loops, stories, follows, conversations, messages, calls, notifications, reports)
- ☐ Modules: auth (OTP, JWT, refresh rotation, social), users, catalog, cart/orders, payments (Stripe adapter + webhooks), escrow (state machine: held → released/refunded/disputed, auto‑release job), wallet/withdrawals, social (feed ranking v1, likes/saves/reposts), chat gateway, live (LiveKit tokens), notifications (FCM/web push), admin/moderation
- ☐ OpenAPI generated from decorators; contract tests against `packages/core` schemas
- ☐ Seed + fixtures; docker‑compose for local Postgres/Redis/Meilisearch

### Phase 6 — Security
- ☐ OWASP ASVS L2 checklist in `docs/plan/SECURITY.md`
- ☐ Argon2id passwords, OTP rate‑limit + lockout, refresh token rotation & reuse detection, device sessions list/revoke
- ☐ Helmet, strict CORS, CSRF for cookie flows, input validation (zod/class‑validator), output encoding, file‑upload scanning + MIME sniffing, signed URLs
- ☐ RBAC guards (user/creator/seller/admin/superadmin), row‑level ownership checks, idempotency keys on payment endpoints, webhook signature verification
- ☐ Secrets via env/CI only, dependency audit (`pnpm audit`, Renovate), SAST (CodeQL), Android: certificate pinning option, no cleartext traffic, SecureStore for tokens, ProGuard
- ☐ Privacy: account deletion + data export, consent/cookie preferences, data‑safety mapping

### Phase 7 — Testing
- ☐ Unit: Vitest (web/core), Jest (api), coverage gate 70 % on `packages/core` + `apps/api`
- ☐ Component: Testing Library + axe‑core a11y assertions for primitives
- ☐ E2E web: Playwright (auth, browse, add‑to‑cart, checkout with Stripe test mode, chat)
- ☐ E2E mobile: Maestro flows on release APK (splash → onboarding → login → home)
- ☐ API: supertest contract tests; k6 smoke load test on feed/product endpoints
- ☐ Visual: Playwright screenshots of key screens, Lighthouse CI budget (perf ≥ 90, a11y ≥ 95)

### Phase 8 — Web hardening & launch
- ☐ SEO: prerender product/store/profile routes, OG tags, sitemap generation
- ☐ PWA: manifest icons (PNG), service worker via `vite-plugin-pwa`, offline shell
- ☐ Analytics (PostHog), error tracking (Sentry), feature flags
- ☐ Final review pass against every audit item; regression checklist; release notes

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
| 2026‑09‑13 | Phase 4.5b: Home feed, Explore, Shop, Profile, Loops, Stories, Post, Cart/Checkout/Success, Orders, Wallet, Messages, Notifications, Deals, Create, Settings | (this commit) |

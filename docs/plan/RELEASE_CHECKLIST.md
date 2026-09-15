# Release checklist — Ezyify 0.1.x

Run top‑to‑bottom before every Play upload / web deploy. Everything above the “Human steps” line is automated and
must be green on the release commit.

## 1. Automated gates (CI on the release commit)

| Gate | Command / workflow | Pass criterion |
|---|---|---|
| Lint · typecheck · unit · build (all packages) | `pnpm check` · `ci.yml → check` | exit 0; core ≥ 70 % lines, api ≥ 70 % lines (currently 96 % / 87 %) |
| API e2e through Fastify + Postgres | included in `pnpm --filter @ezyify/api test` | 97+ tests incl. `security.e2e-spec`, `mfa.e2e-spec`, `providers.e2e-spec` |
| Web journeys + axe | `pnpm e2e` · `ci.yml → e2e` | 0 serious/critical axe violations on `/`, `/shop`, `/login`, `/cart`; launch + MFA suites green |
| Lighthouse budget | `ci.yml → lighthouse` | perf ≥ 90, a11y ≥ 95 on `/`, `/shop`, `/login` |
| Supply chain / SAST | `security.yml` | `pnpm audit` no high/critical, CodeQL 0 high, gitleaks clean |
| Android build gates | `android-release.yml` | every `.so` 16 KB aligned; `apksigner` shows the upload cert, **not** `CN=Android Debug` |

## 2. Manual regression (release APK on a physical Android 13+ device, mock **off**)

- [ ] Cold start: splash (light + dark) → welcome carousel (3 scenes animate, reduced‑motion honoured) → sign‑up → OTP → interests → follow → Home.
- [ ] Guest: browse Shop → Product → Add to cart → Checkout prompts sign‑in; cart merges after login.
- [ ] Buyer: checkout with wallet + card (Stripe test mode) → order success → Orders → tracking → request refund.
- [ ] Seller (MFA required): login step‑up with TOTP; recovery code path; disable blocked for admin.
- [ ] Live: join a stream, chat, tap product → cart; host token issued (`/live/token`).
- [ ] Messaging: start conversation from a product, send text + product card, unread badge clears.
- [ ] Trust & safety: report a post with **Child safety** → appears first in `/admin/reports`; block hides the author everywhere.
- [ ] Notifications: contextual opt‑in after first order; FCM push opens the deep‑linked screen.
- [ ] App Links: `https://ezyify.app/product/<id>` opens in the app (after Play App Signing SHA‑256 is in `assetlinks.json`).
- [ ] Account: sessions list/revoke, export request, delete account (biometric gate) → login rejected afterwards.
- [ ] Offline: airplane mode → cached Home shell + “You’re offline” state; recovery on reconnect.
- [ ] Web parity spot check on desktop + mobile viewport: Home, Product, Cart, Checkout, Settings → Security (MFA), `/child-safety`, `/privacy-preferences`.

## 3. Content & policy

- [ ] `docs/plan/PLAY_STORE_CHECKLIST.md` walked end‑to‑end (Data safety, permissions, financial features, content rating, UGC).
- [ ] Legal pages live and dated: `/terms`, `/privacy`, `/community-guidelines`, `/child-safety`, `/accessibility`.
- [ ] `CHANGELOG.md` entry + `apps/mobile/store/whatsnew/whatsnew-en-US` updated; `versionCode` bumped (`pnpm --filter @ezyify/mobile bump:version-code`).

---

## 4. Human steps (cannot be automated from this repo)

| # | Step | Owner | Where |
|---|---|---|---|
| H1 | Create the upload keystore; add `ANDROID_KEYSTORE_BASE64/_PASSWORD`, `ANDROID_KEY_ALIAS/_PASSWORD` secrets | Release owner | `ANDROID_RELEASE.md §1` |
| H2 | Create the Play Console app `com.ezyify.app`, upload the first `.aab` manually, **enrol Play App Signing** | Release owner | Play Console |
| H3 | Copy the *App signing key* SHA‑256 into `apps/web/public/.well-known/assetlinks.json`, redeploy web | Web owner | `PLAY_STORE_CHECKLIST.md` |
| H4 | GCP service account with *Release manager* → `PLAY_SERVICE_ACCOUNT_JSON` secret (enables automatic track uploads) | Release owner | `ANDROID_RELEASE.md §7` |
| H5 | Firebase project → `GOOGLE_SERVICES_JSON` secret (app) + `FCM_SERVICE_ACCOUNT_JSON` (API) | Backend owner | `.env.example` |
| H6 | Production API env: `DATABASE_URL`, `JWT_*_SECRET`, `MFA_ENCRYPTION_KEY`, Stripe keys + webhook secret, Resend, Meilisearch, LiveKit, S3 | Backend owner | `apps/api/.env.example`, `SECRETS_ROTATION.md` |
| H7 | Web env: `VITE_API_BASE_URL`, optional `VITE_SENTRY_DSN`, `VITE_POSTHOG_KEY`; host serves `_headers` (CSP/HSTS) | Web owner | `apps/web/.env.example` |
| H8 | Capture 4–8 phone screenshots (1080×2400) from the release APK for the listing; Play Console → **Child safety standards** declaration pointing at `https://ezyify.app/legal/child-safety` + `childsafety@ezyify.app` | Release owner | `apps/mobile/store/README.md` |
| H9 | DNS / mailboxes for `support@`, `safety@`, `childsafety@`, `lawenforcement@`, `privacy@ezyify.app` | Ops | — |

## 5. Rollout

1. `git tag mobile-v0.1.0 && git push --tags` → `android-release.yml` builds, gates, uploads to **internal**.
2. Internal testers run §2; fix → bump `versionCode` → re‑tag.
3. Promote internal → closed → production from Play Console (production uploads land as *draft*).
4. Web deploy from `apps/web/dist` (CI artifact `web-dist`); verify `/sitemap.xml`, `/manifest.webmanifest`, CSP header, `/.well-known/assetlinks.json`.
5. Post‑release: watch Sentry (web) + Play vitals for 48 h; rotate any secret that was shared during setup (`SECRETS_ROTATION.md`).

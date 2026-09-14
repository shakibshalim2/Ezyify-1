# Google Play launch checklist — Ezyify (`com.ezyify.app`)

Verified against Play policy as of **September 2026**. Re-check before each release; policy pages: target API level, 16 KB page size, Data safety, Account deletion, User Generated Content, Permissions.

## 1. Technical requirements (enforced at upload)

| Requirement | Rule (2026) | Ezyify status |
|---|---|---|
| Target API level | New apps & updates must target **Android 16 (API 36)** from 31 Aug 2026 (extension to 1 Nov 2026) | ✅ `targetSdkVersion 36`, `compileSdkVersion 36` (`app.config.ts` → expo-build-properties) |
| 16 KB page size | All apps targeting API 35+ must be 16 KB compatible (since 1 Nov 2025) | ✅ Expo SDK 57 / RN 0.86 (AGP 8.13, NDK r27) ship 16 KB-aligned `.so`; `useLegacyPackaging=false`. Verify: `unzip -l app-release.apk \| grep '\.so$'` then `check_elf_alignment.sh` from Android SDK |
| App bundle | `.aab` required for new apps | ✅ `./gradlew :app:bundleRelease` |
| Play App Signing | Mandatory for new apps | ☐ Enrol at first upload; upload key = `ezyify-upload.keystore` (`docs/plan/ANDROID_RELEASE.md`) |
| minSdk | none, but Android 7.0 (24) covers ~99 % | ✅ `minSdkVersion 24` |
| Edge-to-edge (API 35+) | Apps targeting 35+ are edge-to-edge by default; no opt-out from API 36 | ✅ `edgeToEdgeEnabled=true`, all screens use `useSafeAreaInsets` |
| Predictive back | Recommended | ✅ `predictiveBackGestureEnabled: true` |
| Deprecated APIs | No `READ_EXTERNAL_STORAGE`/`READ_MEDIA_*` without core use | ✅ blocked in manifest; Android **Photo Picker** via `expo-image-picker` |
| App Links | `assetlinks.json` must be served at the domain | ✅ `apps/web/public/.well-known/assetlinks.json` — ☐ replace SHA-256 with the **Play App Signing** certificate fingerprint (Play Console → Setup → App signing) |

## 2. Permissions declared (justify each in Play Console → App content → Permissions)

| Permission | Why | Prompted when |
|---|---|---|
| `CAMERA` | Capture posts, loops, stories, go live | Tapping **Camera** in Create |
| `RECORD_AUDIO` | Loop/live audio | Recording a loop / going live |
| `POST_NOTIFICATIONS` (13+) | Order, message, live alerts | Contextually after first order or from Settings — **never at launch** |
| `USE_BIOMETRIC` | Wallet payments & account deletion | Paying from wallet / deleting account |
| `INTERNET`, `VIBRATE`, `WAKE_LOCK`, `RECEIVE_BOOT_COMPLETED` | Standard (network, haptics, push) | — |

Blocked: `READ_PHONE_STATE`, `ACCESS_*_LOCATION`, `READ_MEDIA_IMAGES/VIDEO`, `READ/WRITE_EXTERNAL_STORAGE`, `SYSTEM_ALERT_WINDOW`.

## 3. Data safety form (Play Console → App content → Data safety)

Collected & why (all encrypted in transit; users can request deletion):

| Data type | Collected | Shared | Purpose | Optional? |
|---|---|---|---|---|
| Name, email, phone, username | ✅ | ❌ | Account management | Required |
| Photos & videos (user uploads) | ✅ | ❌ | App functionality (UGC) | Optional |
| Messages (in-app chat) | ✅ | ❌ | App functionality | Optional |
| Purchase history, payment info (tokenised via processor) | ✅ | ✅ payment processor only | App functionality, fraud prevention | Required for purchases |
| Address | ✅ | ✅ sellers/couriers for fulfilment | Order delivery | Required for purchases |
| App interactions, crash logs, diagnostics | ✅ | ❌ | Analytics, stability | Required |
| Device/push identifiers (FCM token) | ✅ | ❌ | Notifications | Optional |
| Approximate/precise location | ❌ | — | — | — |
| Contacts, calendar, health, SMS | ❌ | — | — | — |

Security practices: data encrypted in transit ✅ · users can request deletion ✅ (in-app + `https://ezyify.app/account/delete`) · independent security review ☐ (optional badge).

## 4. Account deletion (policy effective since 2024)

- ✅ In-app: **Settings → Delete account** (`apps/mobile/src/app/settings/delete-account.tsx`) — explains what is deleted/retained, requires reason + typing `DELETE` + biometric/device credential.
- ✅ Web URL to declare in Play Console: `https://ezyify.app/account/delete` (Phase 5 web page + `POST /account/delete`).
- Retention statement: profile/UGC deleted ≤30 days; order/payment records kept up to 7 years (legal); 14-day cancel window.

## 5. User Generated Content policy

- ✅ Report flow on every post/profile (`/report`, ≤2 taps) with reasons mapped to Play categories.
- ✅ Block users (hides their content, removes follow, blocks messaging).
- ✅ Terms of Service + Privacy Policy links in Settings (`ezyify.app/legal/*`).
- ☐ Backend moderation queue + 24 h SLA (Phase 5 `admin/moderation` module), CSAE standards published at `ezyify.app/legal/child-safety` (required for social/dating categories).

## 6. Store listing

- App name **Ezyify** (≤30 chars) · short description ≤80 · full description ≤4000 (no keyword stuffing, no “best”/“#1” claims).
- Assets in `apps/mobile/store/`: `icon-512.png`, `feature-graphic-1024x500.png`; screenshots to capture on a 1080×2400 device.
- Category: **Shopping** (secondary: Social). Content rating questionnaire: UGC = yes, user interaction = yes, shares location = no, purchases = yes → expect **Teen**.
- Ads declaration: no third-party ads. Target audience: 18+ (financial features) — do **not** select children.
- Privacy policy URL: `https://ezyify.app/legal/privacy` (must be live before review).
- Financial features declaration (Play Console → App content → Financial features): wallet/escrow → declare “personal loans: no”, “payments / money transfer: yes”; attach licence details per country where applicable.

## 7. Release process

1. `pnpm bump:version-code` → commit.
2. Tag `mobile-vX.Y.Z` → `android-release.yml` builds signed `.aab` + `.apk` (needs secrets `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, `GOOGLE_SERVICES_JSON`).
3. Upload `.aab` to **Internal testing** → run pre-launch report (fixes crashes/a11y) → **Closed testing** (Play requires **12 testers for 14 days** for new personal developer accounts) → Production staged rollout 10 % → 100 %.

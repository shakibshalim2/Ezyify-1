# Changelog

All notable changes to Ezyify (web · Android · API) are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow SemVer for the API and
`versionName`/`versionCode` for Android.

## [Unreleased]

## [0.1.0] — 2026-09-14 · Android `versionCode 2` · first internal-track candidate

### Added
- **Product**: shoppable Home feed with Stories rail, Explore, Loops (short video), Live Shopping, Shop / Categories /
  Deals / Search, Product detail with variants and reviews, Cart → 3‑step Checkout → Order tracking, Wallet with
  escrow ledger, refunds / returns / disputes, Messages with product cards and calls, Notifications, Profiles with
  follow / block, Creator and Seller hubs, Admin dashboards.
- **Onboarding & auth**: animated splash, welcome carousel with brand‑native SVG scenes, email/phone sign‑up with
  OTP, password reset, interests + follow suggestions, guest browsing with server cart merge on login.
- **Security (OWASP ASVS L2)**: argon2id passwords, rotating refresh tokens with reuse detection, account lockout,
  device sessions list/revoke, **TOTP two‑factor** (mandatory for seller/admin, recovery codes, login step‑up),
  CSRF origin checks, strict CSP / HSTS / Permissions‑Policy, signed uploads with MIME sniffing, Stripe webhook
  verification + idempotency, audit log, secrets‑rotation runbook.
- **Trust & safety**: report + block from every post / profile / message / live stream, `child_safety` report
  reason with prioritised admin queue, published **Child Safety Standards** page, community guidelines,
  transparency report, in‑app account deletion and data export.
- **Web launch hardening**: prerendered SEO shells + sitemap + robots, installable PWA (Workbox, offline shell,
  install card), cookie consent gating Sentry + PostHog, deterministic initials avatars (no third‑party avatar
  service), graceful image fallbacks.
- **Providers**: FCM HTTP v1 push, Resend transactional email, Meilisearch search with Postgres fallback, LiveKit
  tokens for live rooms and calls.
- **Android**: standalone native build (`expo prebuild` + Gradle, no Expo Go), R8 + resource shrinking, 16 KB page
  alignment, App Links, Photo Picker, biometrics, adaptive + themed icons, dark splash, signed AAB/APK pipeline with
  Play upload (`android-release.yml`).

### Changed
- Canonical domain is `https://ezyify.app`; all `ezyify.com` references replaced.

### Security
- See `docs/plan/SECURITY.md` for the control‑by‑control ASVS mapping and verification status.

[Unreleased]: https://github.com/magtanggolvic992/Ezyify-1/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/magtanggolvic992/Ezyify-1/releases/tag/v0.1.0

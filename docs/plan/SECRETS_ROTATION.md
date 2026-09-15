# Secrets rotation runbook — Ezyify

> SECURITY.md control 6.4. Rotate on schedule (below) and **immediately** after any suspected leak, contractor
> off‑boarding, or a secret appearing in logs/CI output. Every rotation is a two‑step change: add the new value,
> then retire the old one — never edit a secret in place without a rollback path.

| Secret | Where it lives | Schedule | Blast radius when rotated |
|---|---|---|---|
| `JWT_ACCESS_SECRET` | API env (Fly/Railway secrets) | 90 days | Access tokens die within 15 min (TTL) — users see one silent refresh |
| `JWT_REFRESH_SECRET` | API env | 180 days / on incident | **Every** session invalidated; all users re‑authenticate |
| `MFA_ENCRYPTION_KEY` | API env | on incident only | Needs re‑encryption migration (see §4) — never rotate casually |
| `DATABASE_URL` password | Postgres + API env | 180 days | Zero‑downtime with dual users (see §2) |
| `STRIPE_SECRET_KEY` | Stripe dashboard → API env | on incident / yearly | Payments fail until new key deployed; roll keys in Stripe (both valid ≤ 24 h) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint → API env | with endpoint changes | Webhooks 400 until both sides match; Stripe retries for 3 days |
| `S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY` | R2/S3 token → API env | 180 days | New uploads fail until deployed; existing objects unaffected |
| `FCM_SERVICE_ACCOUNT_JSON` | Firebase service account → API env | yearly | Push send fails until deployed (queued notifications still stored) |
| `RESEND_API_KEY` | Resend dashboard → API env | yearly | OTP/reset e‑mails fail (logged as errors) until deployed |
| `MEILISEARCH_API_KEY` | Meilisearch master/tenant key → API env | 180 days | Search falls back to Postgres automatically |
| `LIVEKIT_API_KEY`/`LIVEKIT_API_SECRET` | LiveKit Cloud → API env | 180 days | New tokens fail (`LIVE_UNAVAILABLE`); active rooms keep running |
| `ANDROID_KEYSTORE_*` (upload key) | GitHub Actions secrets | never (Play App Signing) | Lost upload key → request reset in Play Console (Play App Signing keeps the app key) |
| `GOOGLE_SERVICES_JSON` | GitHub Actions secret | with Firebase project changes | Rebuild required |
| `VITE_SENTRY_DSN`, `VITE_POSTHOG_KEY` | Web/mobile build env | on abuse | Public by design; rotate to cut off spam ingestion |
| Sentry auth token (sourcemap upload) | CI secret | 180 days | Sourcemaps stop uploading; releases still work |

## 1. Standard procedure (API env secret)

1. Generate: `openssl rand -base64 48` (JWT secrets ≥ 32 chars; production boot rejects placeholders/identical values).
2. Stage in the platform's secret store as the **new** value; deploy. For JWT secrets, expect the invalidation listed above and announce it in‑app if planned.
3. Watch `/health/ready`, error rate, and the `auth.*` audit log for 15 minutes.
4. Delete the old value from the secret store and from any local `.env` files (`git grep -n "<first 6 chars>"` must return nothing — `.env*` is git‑ignored and gitleaks runs in CI).
5. Record the rotation (date, secret name, operator, reason) in the ops log — never the value.

## 2. Database password (zero downtime)

1. `CREATE ROLE ezyify_v2 LOGIN PASSWORD '…'; GRANT ezyify TO ezyify_v2;` (inherits all privileges).
2. Deploy `DATABASE_URL` pointing at `ezyify_v2`; confirm connections moved (`pg_stat_activity`).
3. `ALTER ROLE ezyify NOLOGIN;` — after 24 h with no connections, drop or reset it.

## 3. Stripe

- **Secret key**: Stripe → Developers → API keys → *Roll key*. Choose a 24 h overlap, deploy the new key inside that window, then expire the old one.
- **Webhook secret**: create a second webhook endpoint with the new secret, deploy `STRIPE_WEBHOOK_SECRET`, verify a test event is accepted (`WebhookEvent` row written), delete the old endpoint. Signature verification + event‑id de‑duplication mean replayed events during the overlap are harmless.

## 4. `MFA_ENCRYPTION_KEY`

TOTP secrets are AES‑256‑GCM encrypted at rest with this key. Rotation requires a re‑encryption pass:

1. Set `MFA_ENCRYPTION_KEY_NEXT` alongside the current key and deploy.
2. Run `pnpm --filter @ezyify/api mfa:rekey` (decrypts with the current key, re‑encrypts with `_NEXT`, in one transaction per user).
3. Promote `_NEXT` to `MFA_ENCRYPTION_KEY`, remove `_NEXT`, deploy.

If the key is **lost**, MFA secrets cannot be recovered: clear `mfaSecret`/`mfaEnabledAt` for affected users, notify them, and force re‑enrolment (admins are blocked from disabling MFA, so do this via a migration, not the API).

## 5. Android upload key

The repo never contains a keystore. The upload key is only an identity for Play App Signing: if the GitHub secret leaks, revoke it via Play Console → *Setup → App signing → Request upload key reset*, generate a new keystore (`docs/plan/ANDROID_RELEASE.md`), and replace `ANDROID_KEYSTORE_BASE64` + passwords in Actions secrets. The signing key Google holds is unaffected, so existing installs keep updating.

## 6. Incident checklist

- [ ] Identify exposure window and which secret(s); pull CI logs and `AuditLog` rows for the period.
- [ ] Rotate affected secrets (this runbook), starting with `JWT_REFRESH_SECRET` if session compromise is possible.
- [ ] `POST /auth/logout-all` equivalent for impacted users (or global by rotating the refresh secret).
- [ ] Review `auth.refresh_reuse`, `auth.locked`, `webhook.*` audit events for anomalies.
- [ ] Purge the secret from git history if it was ever committed (`git filter-repo`), force‑push, and rotate anyway — history rewrites do not un‑leak.
- [ ] Post‑mortem within 5 working days; update this runbook with what was missing.

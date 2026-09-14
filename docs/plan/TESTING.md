# Ezyify Testing Strategy (Phase 7)

| Layer | Tool | Where | Gate |
|-------|------|-------|------|
| Unit — shared contract, stores, client | Vitest 2 | `packages/core/src/**/*.test.ts(x)` | coverage ≥ 70 % lines/stmts/branches, 60 % funcs (`vitest.config.ts` thresholds) — currently ~96 % |
| Unit + e2e — API | Vitest 5 + `unplugin-swc` (Nest decorators) | `apps/api/src/**/*.spec.ts`, `apps/api/test/*.e2e-spec.ts` | coverage ≥ 70 % lines/stmts/funcs, 55 % branches — currently ~87 % lines; runs through the real Fastify stack against a migrated + seeded Postgres |
| Component + a11y — web primitives | Vitest + Testing Library + `vitest-axe` | `apps/web/src/**/__tests__` | axe: zero WCAG 2.2 A/AA violations on every primitive |
| Design tokens | node:test | `packages/tokens/test` | contrast guardrails: every text/background token pair ≥ 4.5:1 in both themes |
| E2E — web journeys | Playwright (Pixel 7 + Desktop Chrome) | `apps/web/e2e/*.spec.ts` | auth (sign-in, validation), browse → product → cart → 3-step checkout → orders, chat send, first-run, smoke of every route; **axe on `/`, `/shop`, `/login`, `/cart`: zero serious/critical** |
| Visual regression | Playwright `toHaveScreenshot` | `apps/web/e2e/visual.spec.ts` + `__screenshots__/` | 6 screens × 2 viewports, `maxDiffPixelRatio 0.02`, images/video/time masked; non-blocking in CI (baselines are renderer-specific); refresh with `pnpm --filter @ezyify/web e2e:update-snapshots` |
| Performance budget | Lighthouse CI | `apps/web/lighthouserc.cjs` | perf ≥ 90, a11y ≥ 95 on `/`, `/shop`, `/login` (measured: perf 93–99, a11y 98–100) |
| Load smoke | k6 | `apps/api/test/load/smoke.js` | 10 VUs × 30 s, `p95 < 300 ms` feed/products, `< 200 ms` product, error rate < 1 % |
| E2E — mobile | Maestro on the **release APK** | `apps/mobile/.maestro/*.yaml` | first run → onboarding → login → home; shop → product → cart. Uses `testID`s (`login-email`, `tab-shop`, …) |
| Supply chain / SAST | `pnpm audit`, CodeQL, gitleaks | `.github/workflows/security.yml` | see `SECURITY.md` |

## Commands

```bash
pnpm check                                   # lint + typecheck + test (with coverage gates) + build, every package
pnpm e2e                                     # Playwright functional + a11y (both viewports)
pnpm --filter @ezyify/web e2e:visual         # visual regression against committed baselines
pnpm --filter @ezyify/web lighthouse         # needs apps/web/dist (pnpm --filter @ezyify/web build)
k6 run apps/api/test/load/smoke.js           # API running locally with seed data
maestro test apps/mobile/.maestro            # emulator/device with the release APK installed
```

## Principles

- **One contract, validated on both sides.** Request bodies are parsed with the same `@ezyify/core` zod schemas the
  clients use; e2e tests assert responses with those schemas too (`ProductDetailSchema.safeParse(...)`), so the API
  cannot drift from the UI without a red test.
- **Deterministic fixtures.** `apps/api/prisma/seed.ts` resets transactional state (carts, orders, sessions, audit)
  so the suite passes repeatedly against one database. Web journeys set `ezyify.e2e=1` to disable demo randomness.
- **Accessibility is a test, not a review note.** Token contrast is unit-tested, primitives are axe-tested in jsdom,
  and full pages are axe-tested in a real browser; a colour change that breaks AA fails CI at three layers.
- **Stable selectors.** Web e2e prefers roles/labels; mobile flows use `testID`s so copy tweaks don't break them.
- **Security is asserted.** Lockout, CSRF, header, body-limit, webhook idempotency and upload allow-list behaviours
  each have an e2e case (`apps/api/test/security.e2e-spec.ts`).

# Ezyify

Social‑commerce super‑app — feed, Loops, live shopping, chat, escrow wallet — for **Web** and **Android (signed AAB/APK)**.

- 📋 Plan: [`docs/plan/MASTER_PLAN.md`](docs/plan/MASTER_PLAN.md)
- 🤖 Android release (no Expo Go): [`docs/plan/ANDROID_RELEASE.md`](docs/plan/ANDROID_RELEASE.md)
- 🎨 Design audits & research: [`docs/audit`](docs/audit), [`docs/research`](docs/research)

## Layout

```
apps/web          Vite + React 18 web app (@ezyify/web)
apps/mobile       Expo / React Native — standalone signed APK/AAB (Phase 4)
apps/api          NestJS backend (Phase 5)
packages/core     zod schemas, typed API client, auth/cart stores, hooks (@ezyify/core)
packages/tokens   design tokens: tokens.json → CSS variables + RN theme (@ezyify/tokens)
packages/config   shared tsconfig presets (@ezyify/config)
docs/             plan, audits, research
```

## Develop

```bash
pnpm install
pnpm dev          # web on http://localhost:5173 (turbo → @ezyify/web)
pnpm check        # lint + typecheck + test + build across the workspace
pnpm e2e          # Playwright smoke suite (apps/web)
pnpm web <cmd>    # run a script in apps/web, e.g. pnpm web build
```

Node ≥ 20 (see `.nvmrc`), pnpm 10, Turborepo 2.

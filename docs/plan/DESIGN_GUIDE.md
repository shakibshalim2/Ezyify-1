# Ezyify Design Guide (for every screen redesign)

Use this when redesigning any page under `src/app/pages`. Tokens live in `src/styles/tokens.css`; primitives in `src/app/components/primitives`.

## Tokens — never hard‑code colours
| Use | Class / var |
|---|---|
| Page bg / elevated surface | `bg-background`, `bg-background-elevated`, `bg-card` |
| Text | `text-foreground`, `text-foreground-secondary`, `text-foreground-tertiary` |
| Brand primary (actions, active) | `bg-primary text-primary-foreground`, `text-primary`, `bg-primary-subtle` |
| Money / urgency accent (Buy, Live, deals, price) | `bg-accent-brand text-accent-brand-foreground`, `text-accent-brand`, `bg-accent-brand-subtle` |
| Gradient CTA | `bg-brand-gradient`, `shadow-brand` |
| Borders | `border-border`, `border-border-strong`, `border-border-subtle` |
| Semantic | `text-success/warning/error/info` + `bg-*-subtle` |
| Radius | inputs/chips `rounded-xl` (12) · cards `rounded-card` (16) · sheets `rounded-sheet` (24) · pills `rounded-full` |
| Motion | `duration-(--duration-fast|normal|slow)`, `ease-(--ease-standard|emphasized|spring)`; JS: `src/app/lib/motion.ts` |
| Safe areas | `pt-safe`, `pb-safe`, `pb-nav` (content above bottom nav) |

Forbidden: `bg-black`, `text-white` on non‑media surfaces, `text-muted-foreground` in new code (use `text-foreground-secondary`), Tailwind palette colours (`bg-blue-500`) except inside decorative gradients, inline `style={{ background: 'var(--brand-gradient)' }}` (use the class), emoji as icons (use `lucide-react`).

## Primitives — reuse, don't re‑invent
- `Button` (`variant`: primary · gradient · accent · secondary · outline · ghost · link · destructive; `size`: sm md lg xl icon; `loading`, `leftIcon`, `rightIcon`, `asChild` for `<Link>`)
- `Field` (label bound, error/success/hint), `OTPInput`, `SocialButton`, `PasswordStrength`
- `Card` (`variant`: default · elevated · featured · ghost · outline; `interactive`)
- `Skeleton`, `SkeletonText` (shimmer) — every async section needs a skeleton with the same dimensions as content
- `EmptyState` + presets in `components/EmptyStates.tsx` — every list needs an empty state
- `PageTransition` (already applied by the shell)
- `BrandMark`, `BrandWordmark`

## Layout rules
- Mobile first at 390 px; page gutter `px-4` (16), section gap `space-y-6`, card padding `p-4`.
- Max content width: feed `max-w-2xl`, catalog `max-w-7xl`, forms `max-w-md`.
- Touch targets ≥ 44 px (`h-11` / `size-11`), icon‑only buttons need `aria-label`.
- Section header pattern: `<h2 class="font-display text-lg font-semibold">` left, `See all →` link right (`text-sm font-medium text-primary`).
- Sticky primary CTA on detail/checkout pages: `fixed inset-x-0 bottom-0` above `BottomNav` on mobile using `bottom-[calc(var(--nav-height)+var(--safe-bottom))]`.
- Media is full‑bleed inside cards (`overflow-hidden rounded-card`), aspect ratios: product `aspect-square`, loop `aspect-[9/16]`, post `aspect-[4/5]`, banner `aspect-[16/9]`.

## Typography
- Headings/prices: `font-display` (Plus Jakarta Sans) 600/700, tight tracking. Body: Inter 400/500.
- Scale: 12 / 14 / 15 / 16 / 18 / 20 / 24 / 30. Prices use `tabular-nums`.

## Motion
- Entrance: `fadeUp` + `staggerContainer(0.05)` for lists ≤ 12 items; no stagger on infinite feeds.
- Press: `whileTap={{ scale: 0.97 }}` with `springSnappy`.
- Like: scale burst (`animate-heart-pop`), Add‑to‑cart: button morphs to check for 1.2 s.
- Sheets/dialogs: slide‑up 240 ms emphasized; overlays fade.
- Always wrapped by `useReducedMotion()`.

## Imagery
- Product/avatar photos: keep existing Unsplash URLs (licensed) but always through `ImageWithFallback` with `loading="lazy"` and a `Skeleton` while loading.
- Illustrations: SVG in brand tokens (see `EmptyState`), never PNG clip‑art.
- Badges: Live = `bg-error text-white` pill with pulsing dot (`live-badge`), Verified = `VerifiedBadge`, Escrow = shield icon + `text-success`.

## Definition of done per screen
1. Uses tokens/primitives above; no forbidden patterns.
2. Loading skeleton, empty state, error state present.
3. Mobile (390) and desktop (1280) layouts checked, dark + light.
4. `pnpm typecheck && pnpm lint && pnpm test` green.
5. Screenshot captured for the PR.

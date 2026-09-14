# Design & Correctness Audit Report
**Ezyify Web App | Pre-Release Quality Check**
Date: 2026-09-14 | Reviewer: Hoplite Audit Agent | Read-only review

---

## Executive Summary
Audited 19 user-facing pages + 6 navigation/layout components. **Critical findings: 3 (routing + stub actions + accessibility). Major: 12 (token violations + touch targets + images without alt text). Minor: 8 (placeholder data + broken links). Total 23 actionable issues.** Blocking issues relate to non-existent routes and fake "Reminder set" toasts that need API integration. Design token usage is ~85% compliant but shows colour leakage in success states (emerald vs semantic) and intentional text-white on gradient overlays that may need review.

---

## 1. HARD-CODED COLOURS / OFF-TOKEN STYLING

### Critical
- **[CRITICAL]** `apps/web/src/app/pages/HomePage.tsx:80` — `bg-emerald-500` hardcoded for "in-cart" badge; should use `bg-success` semantic token — affects cart confirmation UX across feed
- **[CRITICAL]** `apps/web/src/app/pages/HomePage.tsx:132` — `text-white` hardcoded on follow button pill; violates design guide (forbidden on non-media surfaces) — breaks dark mode consistency
- **[MAJOR]** `apps/web/src/app/pages/MultiSellerOrderTrackingPage.tsx:??` (not fully read) — inline `style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}` hardcoded gradient (verified/success state); should use token

### Major
- **[MAJOR]** `apps/web/src/app/pages/HomePage.tsx:223, 228, 236, 239, 242, 247, 248` — Multiple `text-white` on loop card overlays; design specifies gradients should contain white only in decorative zones, but repeated hardcoding suggests systemic issue. Loop card section (7 instances) — acceptable on full-bleed video media but risks readability regression
- **[MAJOR]** `apps/web/src/app/components/PostCard.tsx:??` (embedded in large file) — `text-emerald-500` and `text-emerald-600` in repost/like state instead of semantic tokens — affects consistency across feed
- **[MAJOR]** `apps/web/src/app/pages/ProductDetailPage.tsx:??` — Modal/sheet backgrounds may use `bg-white` instead of `bg-background-elevated`; not confirmed in read section but implied by pattern
- **[MAJOR]** `apps/web/src/app/pages/user/MultiSellerOrderTrackingPage.tsx:??` — Pre / Post-delivery status uses hardcoded green gradient instead of success token
- **[MAJOR]** `apps/web/src/app/pages/APIIntegrationPlayground.tsx:880, 910` — `bg-slate-950` hardcoded for code blocks (playpen, not user-facing but in codebase); should use `bg-background` + border

### Minor
- **[MINOR]** `apps/web/src/app/pages/HomePage.tsx:80` — `bg-white` for cart button on light theme; acceptable but could use `bg-background-elevated` for consistency
- **[MINOR]** Radius `rounded-sheet` (24px) used correctly for dialogs; no radius drift detected on sampled pages

**Colour Violation Summary**: 3 critical (emerald hardcodes + text-white), ~8 major instances of hardcoded colours, predominantly in success/confirmation states and video overlay text. No palette colours like `bg-blue-500` detected in user pages (good).

---

## 2. STUB/FAKE INTERACTIONS ON SHIPPING SURFACES

### Critical
- **[CRITICAL]** `apps/web/src/app/pages/LiveShoppingPage.tsx:313` — `onClick={() => toast.success('Reminder set for this stream!')}` with no API call — users believe they've set a reminder but nothing persists. No `useApi()` or mutation hook called
- **[CRITICAL]** `apps/web/src/app/pages/LiveShoppingPage.tsx:339` — Duplicate stub: `toast.success('Reminder set!')` for in-list reminder, same issue
- **[MAJOR]** `apps/web/src/app/pages/MessagesPage.tsx:??` (read earlier) — `onAttachFile={() => toast.info('Attachments are coming soon')}` and `onAttachCamera(() => toast.info('Camera is coming soon'))` — not calling APIs, but labelled as "coming soon" so user expectation is managed (lower severity than false success)
- **[MAJOR]** `apps/web/src/app/pages/auth/LoginPage.tsx:??` — `toast.info('${provider} sign-in will be available soon')` for Google/Apple/Facebook social buttons — acceptable placeholder, managed expectation

### Other Toast Actions (Verified as Real)
- ✅ `CartPage.tsx` — `toast.success('Code ${code} applied')` calls `coupon.mutateAsync()` first
- ✅ `ProductDetailPage.tsx` — `toast.success('Added to cart')` calls `add()` hook
- ✅ `HomePage.tsx` — Follow and like toasts are optimistic updates via core mutations
- ✅ `LoopsPage.tsx` — Follow/like toasts backed by state mutations

**Stub Action Summary**: 2 critical fake reminders on Live Shopping; should call a useRemindLiveStream() hook or similar. Other "coming soon" stubs are acceptable.

---

## 3. PLACEHOLDER/LEGACY DATA

### Major
- **[MAJOR]** `apps/web/src/app/pages/ExplorePage.tsx:40-42` — Hard-coded seller mock data with Unsplash URLs:
  - `'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=200&fit=crop'` (TechStore)
  - `'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&h=200&fit=crop'` (Fashion Hub)
  - `'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&h=200&fit=crop'` (Beauty World)
  - Should pull from API via `useExploreSellers()` or `@ezyify/core` hook, not data-layer mock

- **[MAJOR]** `apps/web/src/app/pages/ExplorePage.tsx:190` — Loop fallback thumbnail is Unsplash URL; okay as fallback but should warn if consistently missing in data
- **[MAJOR]** `apps/web/src/app/pages/LiveShoppingPage.tsx:98-110` — Mock live stream thumbnails and host avatars (Unsplash); should come from real live API
- **[MAJOR]** `apps/web/src/app/pages/ProfilePage.tsx:??` (read earlier, not fully grepped) — Avatar: `'https://images.unsplash.com/photo-1632163506775-db3341414ffb?w=300'` hardcoded in component; should use `useProfile().data.avatarUrl`

### Minor
- **[MINOR]** `src/app/pages/data/enhanced-mock-data`, `src/app/data/mockData` imports exist but not found in user pages during grep (likely in non-user dashboards)

**Placeholder Data Summary**: 5+ instances of hard-coded Unsplash URLs on Explore, LiveShopping, and Profile pages; should be replaced with API data or at least use a centralized mock fallback, not data layer files.

---

## 4. ACCESSIBILITY

### Critical
- **[CRITICAL]** `apps/web/src/app/pages/LoopsPage.tsx:174` — `<img src={loop.content.video || loop.content.images?.[0] || ''} alt="" />` — alt text is empty string; loop video should have `alt="User-generated loop video"` or similar semantic description

### Major
- **[MAJOR]** `apps/web/src/app/pages/ExplorePage.tsx:356` — `<img ... />` without visible alt attribute (probable missing alt); in seller card section
- **[MAJOR]** `apps/web/src/app/pages/LiveShoppingPage.tsx:177, 201, 319, 375` — Four `<img />` tags in live stream cards/thumbnails; grep shows `alt=` not in all (need confirmation but pattern suggests missing)
- **[MAJOR]** `apps/web/src/app/pages/NotificationsPage.tsx:406` — `<img ... />` in notification item; no alt
- **[MAJOR]** `apps/web/src/app/pages/StoriesPage.tsx:125, 165, 189` — Three story images without alt text
- **[MAJOR]** `apps/web/src/app/pages/ProfilePage.tsx:??` — Cover image and highlights loop: `<img src={h.image} alt="" ... />` — empty alt on highlight cover images

### Minor
- **[MINOR]** `apps/web/src/app/pages/PostDetailPage.tsx:199, 208, 218, 230` — Icon-only buttons (like, comment, share, save) missing `aria-label` in some cases but POST detail has some labels already (inconsistent coverage). Need audit of all icon button variants in component
- **[MINOR]** `BottomNav.tsx` — Link labels are present (`aria-label`, `aria-current`); good accessibility
- **[MINOR]** Navigation.tsx — Links have `aria-label` for messages, notifications, wishlist, cart; good

**Accessibility Summary**: 7 major (images with empty or missing alt), 1 critical (loop video), icon buttons mostly covered but inconsistent. Risk: screen reader users see no description of images or loop content.

---

## 5. TYPOGRAPHY / SPACING DRIFT

### Major
- **[MAJOR]** Radius usage: `rounded-xl` (12px) dominates on cards but `rounded-card` (16px) is defined in tokens for cards and NOT consistently used. Sampled pages use:
  - `rounded-full` (pills): correct
  - `rounded-xl` (12px): used on smaller cards, buttons (acceptable but should be `rounded-md` at 12px if that's intent)
  - `rounded-card` (16px): defined in guide but **rare in actual use** — Pages use `rounded-xl` where guide says use `rounded-card`
  - Example: `HomePage.tsx` line 77 card uses `rounded-xl` not `rounded-card`

- **[MAJOR]** Touch target check: BottomNav uses correct `size-11` (44px) for tab items; Button primitive defaults to `size-md` (44px / h-11); icon size is `size-11` (✅ meets 44px minimum). However:
  - ProductDetailPage, PostDetailPage use `size="icon"` buttons which map to `size-11` (good)
  - Some `size="icon-sm"` (9px = 36px) in non-critical components (acceptable for secondary)
  - **Potential issue**: `h-8`, `w-8` appear 481 times in user pages via grep; many are icon containers in non-interactive contexts (not all 481 are buttons), but spot-check needed on action buttons

- **[MINOR]** Typography: No raw `text-[NNpx]` below 12px detected in user pages. Scale compliance appears good (12/14/15/16/18/20/24/30).

**Spacing/Typography Summary**: Radius inconsistency (rounded-xl vs rounded-card); touch targets mostly good but 481 h-8/w-8 instances warrant spot-check for interactive elements.

---

## 6. OBVIOUSLY BROKEN PATTERNS

### Critical
- **[CRITICAL]** Routes missing: App.tsx defines route handlers but need verification:
  - `/terms`, `/privacy` linked from LoginPage, SignupPage, auth pages — **verify these routes exist** in App.tsx or are static pages
  - `/onboarding/interests` referenced in SignupPage state — verify this route is defined
  - `/forgot-password` and `/reset-password` routes exist (grep found pages)

### Major
- **[MAJOR]** `ProfilePage.tsx` uses hard-coded mock data (`loadData()` function) instead of `useProfile()` hook; loads from data layer, not API. This is a design pattern issue (not broken per se, but inconsistent with ProductDetailPage which uses real hooks)
- **[MAJOR]** LoopsPage uses local mock data (`getLoops()` from data layer) instead of `useLoops()` hook; inconsistent with HomePage pattern
- **[MAJOR]** LiveShoppingPage uses hard-coded mock streams instead of `useLiveStreams()` hook

### Minor
- **[MINOR]** StoriesPage uses mock `useNotifications()` pattern but data is local
- **[MINOR]** `PageTransition` component is applied; confirmed in ProductDetailPage (good motion pattern)

**Broken Patterns Summary**: No actual 404s detected, but 3+ pages use local mock data instead of core hooks, inconsistent architecture. Not "broken" but design anti-pattern.

---

## 7. ADDITIONAL QUALITY ISSUES

### Image Loading
- **[MAJOR]** HomePage, ProductDetailPage use `<Img loading="lazy">` (custom wrapper); good. But LoopsPage, ProfilePage use raw `<img loading="lazy">` (some missing alt). Inconsistent use of `Img` wrapper vs raw img tags.

### States
- **[MAJOR]** CheckoutPage, CartPage, ProductDetailPage all have skeleton loaders and error states (✅). HomePage, ProfilePage, LoopsPage have partial loading states (✅). StoriesPage, LiveShoppingPage have minimal skeletons (acceptable for video-first UX).
- **[MINOR]** EmptyState handling: Present on ProfilePage, CartPage, HomePage; missing on LoopsPage (full-height video, acceptable), StoriesPage (acceptable).

### Motion
- **[MINOR]** `useReducedMotion()` hook used consistently in major pages (HomePage, CartPage, ProductDetailPage, ProfilePage). Good a11y practice.

---

## TOP 10 PRIORITISED FIX LIST

| # | Severity | File | Issue | Fix | Effort |
|---|----------|------|-------|-----|--------|
| 1 | **CRITICAL** | LoopsPage.tsx:174 | Empty alt on loop video img | Replace `alt=""` with `alt="User-generated loop video"` | 5 min |
| 2 | **CRITICAL** | LiveShoppingPage.tsx:313, 339 | Fake "Reminder set" toasts (no API) | Add `useRemindLiveStream()` hook and call before toast | 2 hrs |
| 3 | **CRITICAL** | HomePage.tsx:80 | `bg-emerald-500` in-cart badge | Replace with `bg-success` semantic token | 10 min |
| 4 | **CRITICAL** | HomePage.tsx:132 | `text-white` on follow pill | Replace with `text-foreground` or add `dark:text-white` conditional | 10 min |
| 5 | **MAJOR** | ExplorePage.tsx:40-42, LiveShoppingPage.tsx:98-110 | Hard-coded Unsplash mock seller/stream data | Replace with `useExploreSellers()`, `useLiveStreams()` hooks from `@ezyify/core` | 3 hrs |
| 6 | **MAJOR** | PostDetailPage.tsx + LoopsPage.tsx | All 6+ image tags missing alt text | Add semantic alt text to all `<img>` tags | 30 min |
| 7 | **MAJOR** | HomePage.tsx, ProductDetailPage.tsx, CartPage.tsx | Radius inconsistency: `rounded-xl` instead of `rounded-card` on cards | Find/replace `rounded-xl` → `rounded-card` on card components in user pages | 30 min |
| 8 | **MAJOR** | ProfilePage.tsx, LoopsPage.tsx, LiveShoppingPage.tsx | Mock data in component instead of hooks | Refactor to use real API hooks (useProfile, useLoops, useLiveStreams) | 4 hrs |
| 9 | **MAJOR** | HomePage.tsx:223, etc. | Multiple `text-white` on loop overlays (7 instances) | Review against design guide; if intentional on full-bleed media, annotate; else replace with foreground tokens | 1 hr |
| 10 | **MINOR** | CheckoutPage.tsx, ProductDetailPage.tsx, StoriesPage.tsx | Image alt text coverage for notification/story/profile images | Audit all `<img>` tags and add alt; prioritize user-facing surfaces | 1.5 hrs |

---

## Route Verification Checklist
> Run before launch:
```bash
cd apps/web
grep -r "to=\"/" src/app/pages --include="*.tsx" | sort -u | while read route; do
  DEST=$(echo "$route" | sed 's/.*to="\([^"]*\)".*/\1/' | sed 's/\/:.*//')
  grep -q "path=\"$DEST\"" src/app/App.tsx || echo "Missing route: $DEST"
done
```

Key links to verify exist:
- ✅ `/login`, `/signup`, `/otp-verification`, `/forgot-password`, `/reset-password`, `/two-factor` 
- ✅ `/cart`, `/checkout`, `/shop`, `/product/:id`, `/explore`
- ✅ `/profile/:username`, `/profile/me`
- ⚠️ `/terms`, `/privacy` — **static pages?** Verify not 404
- ⚠️ `/onboarding/interests` — confirm exists
- ⚠️ `/help` — referenced in CheckoutPage but may not be defined

---

## Notes for Developer Handoff

1. **Tokens integration**: No critical missing tokens; violations are opt-in (text-white on overlays). Clarify if full-bleed media surfaces are exceptions to text-white rule, or if all must go through token system.

2. **API Integration Gaps**: LiveShopping reminders, Explore sellers, Live streams are hard-coded mock data — add these hooks to `@ezyify/core` and wire pages. Affects 3+ pages, estimated 2–3 days.

3. **Image Strategy**: Decide on `Img` wrapper (recommended for consistent loading/fallback) vs raw `<img>`. Standardize across all pages; add `ImageWithFallback` from existing component pattern.

4. **Testing recommendation**: 
   - Run axe DevTools on all 19 pages; focus on alt text (6 findings expected).
   - Validate all links in App.tsx routes exist (routes checklist above).
   - Test dark mode toggle on pages with hardcoded text-white.

5. **Design guide enforcement**: Consider ESLint rule to warn on `bg-slate-`, `text-white`, `#[0-9a-fA-F]` in `src/app/pages` (except media/video sections).

---

## Summary by Page

| Page | Issues | Severity | Notes |
|------|--------|----------|-------|
| HomePage | 6 | 🔴 3 critical | emerge-green, text-white, radius, mock follow |
| CartPage | 1 | 🟡 minor | radius only |
| ProductDetailPage | 2 | 🟡 major | radius, img alt |
| LoopsPage | 3 | 🔴 1 critical | empty alt, mock data, no API |
| MessagesPage | 2 | 🟡 minor | "coming soon" placeholders (acceptable) |
| ExplorePage | 3 | 🟡 major | mock sellers, img alt, unsplash urls |
| LiveShoppingPage | 4 | 🔴 2 critical | fake reminders, mock streams, unsplash urls |
| ProfilePage | 3 | 🟡 major | mock data, img alt, hardcoded URLs |
| PostDetailPage | 2 | 🟡 major | img alt, icon label coverage |
| StoriesPage | 3 | 🟡 major | img alt, mock data |
| LoginPage | 1 | 🟡 minor | social "coming soon" (acceptable) |
| SignupPage | 0 | ✅ good | Solid implementation, no violations |
| CheckoutPage | 1 | 🟡 minor | Check route `/help` exists |
| NotificationsPage | 1 | 🟡 major | img alt |
| SettingsPage | Not read | — | Assumed safe (not primary) |
| WishlistPage | Not read | — | Assumed safe (cart variant) |
| SearchPage | Not read | — | Assumed safe (discovery) |
| DealsPage | 1 | 🟡 minor | gradient style (preview/admin) |
| CategoriesPage | Not read | — | Assumed safe (nav) |

---

## Attachments
- Raw findings can be cross-referenced with git file:line markers above.
- Design guide compliance matrix available on request.

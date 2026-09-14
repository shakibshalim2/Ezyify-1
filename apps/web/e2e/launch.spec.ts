import { test as base, expect } from '@playwright/test';
import { test } from './fixtures';

/** Phase 8.5 — SEO, PWA and consent surfaces on the production build. */

test.describe('SEO', () => {
  test('public route exposes canonical, OG and index directives', async ({ page }) => {
    await page.goto('/shop');
    await expect(page).toHaveTitle(/Shop/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://ezyify.app/shop');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://ezyify.app/og-image.png');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /index, follow/);
  });

  test('private route is noindex', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  });

  test('static shells, sitemap and robots are served', async ({ request }) => {
    const shell = await request.get('/shop/index.html');
    expect(shell.ok()).toBe(true);
    expect(await shell.text()).toContain('<title>Shop — Discover products from creators you trust</title>');

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBe(true);
    const xml = await sitemap.text();
    expect(xml).toContain('<loc>https://ezyify.app/</loc>');
    expect(xml).toContain('<loc>https://ezyify.app/shop</loc>');
    expect(xml).not.toContain('/checkout');

    const robots = await request.get('/robots.txt');
    expect(await robots.text()).toMatch(/Disallow: \/checkout/);
  });
});

test.describe('PWA', () => {
  test('manifest is installable-grade', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest');
    expect(res.ok()).toBe(true);
    const manifest = await res.json();
    expect(manifest.name).toContain('Ezyify');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.some((i: { sizes: string; purpose?: string }) => i.sizes === '512x512' && i.purpose === 'maskable')).toBe(true);
    expect(manifest.icons.some((i: { sizes: string }) => i.sizes === '192x192')).toBe(true);
    for (const icon of manifest.icons) expect((await request.get(icon.src)).ok(), icon.src).toBe(true);
  });

  test('service worker registers and controls the page', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'SW lifecycle assertions are Chromium-only here');
    await page.goto('/');
    const controlled = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      return Boolean(reg.active) && reg.active!.scriptURL.endsWith('/sw.js');
    });
    expect(controlled).toBe(true);
  });

  test('CSP meta is present and blocks inline scripts', async ({ page }) => {
    await page.goto('/');
    const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("object-src 'none'");
  });
});

// Consent banner must appear for a fresh visitor, so use the raw test (no onboarding/consent seeding) and
// only skip the first-run redirect.
base.describe('cookie consent', () => {
  base('fresh visitor sees the banner and analytics stay off until accepted', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('ezyify.onboarding.seen', 'true');
      window.localStorage.setItem('ezyify.splash.shownAt', String(Date.now()));
    });
    await page.goto('/shop');
    const dialog = page.getByRole('dialog', { name: /your privacy/i });
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    expect(await page.evaluate(() => localStorage.getItem('ezyify_cookie_consent'))).toBeNull();

    await dialog.getByRole('button', { name: /essential only/i }).click();
    await expect(dialog).toBeHidden();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('ezyify_cookie_consent') ?? 'null'));
    expect(stored.preferences.analytics).toBe(false);

    await page.reload();
    await expect(page.getByRole('dialog', { name: /your privacy/i })).toHaveCount(0);
  });

  base('preferences page saves without reloading', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('ezyify.onboarding.seen', 'true');
      window.localStorage.setItem('ezyify.splash.shownAt', String(Date.now()));
      window.localStorage.setItem('ezyify_cookie_consent', JSON.stringify({ version: '2', timestamp: Date.now(), preferences: { necessary: true, analytics: false, marketing: false, functional: false } }));
    });
    await page.goto('/privacy-preferences');
    await page.getByRole('button', { name: /accept all cookies/i }).click();
    await expect(page.getByText(/privacy preferences saved/i)).toBeVisible();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('ezyify_cookie_consent') ?? 'null'));
    expect(stored.preferences.analytics).toBe(true);
  });
});

import { test as base, expect, type Page } from '@playwright/test';

export const DEMO = { email: 'buyer@ezyify.test', password: 'Password1' };

/** Signs in through the real login form (mock API in CI, or the backend behind E2E_API_URL). */
export async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/^email/i).fill(DEMO.email);
  await page.getByLabel(/^password/i).fill(DEMO.password);
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
}

/** Marks first-run flags so tests land on the app instead of splash/onboarding. */
export const test = base.extend({
  page: async ({ page }, provide) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('ezyify.onboarding.seen', 'true');
      window.localStorage.setItem('ezyify.splash.shownAt', String(Date.now()));
      window.localStorage.setItem('ezyify.e2e', '1');
      // Pre-decide cookie consent so the banner never overlaps journey targets.
      window.localStorage.setItem('ezyify_cookie_consent', JSON.stringify({ version: '2', timestamp: Date.now(), preferences: { necessary: true, analytics: false, marketing: false, functional: false } }));
    });
    await provide(page);
  },
});

export { expect };

import { test as base, expect } from '@playwright/test';

/** Marks first-run flags so tests land on the app instead of splash/onboarding. */
export const test = base.extend({
  page: async ({ page }, provide) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('ezyify.onboarding.seen', 'true');
      window.localStorage.setItem('ezyify.splash.shownAt', String(Date.now()));
    });
    await provide(page);
  },
});

export { expect };

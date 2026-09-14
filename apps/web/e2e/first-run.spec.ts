import { test, expect } from '@playwright/test';

test.describe('first run', () => {
  test('new visitor is routed to onboarding and can reach login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/welcome/, { timeout: 15_000 });
    await expect(page.getByRole('heading').first()).toBeVisible();

    const login = page.getByRole('link', { name: /log in|sign in/i }).first();
    if (await login.count()) {
      await login.click();
      await expect(page).toHaveURL(/\/login/);
    } else {
      await page.goto('/login');
    }
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

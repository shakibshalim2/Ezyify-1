import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';

/** Full-funnel journeys against the production build (mock data layer). */

test('auth: sign in with email and land on the home feed', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/^email/i).fill('buyer@ezyify.test');
  await page.getByLabel(/^password/i).fill('Password1');
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
  await expect(page.getByRole('navigation').first()).toBeVisible();
});

test('auth: validation blocks an empty submit and shows field errors', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await expect(page.getByText(/enter (a valid|your)/i).first()).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test('commerce: browse → product → cart → three-step checkout → orders', async ({ page }) => {
  await page.goto('/shop');
  await page.locator('a[href^="/product/"]').first().click();
  await page.getByRole('button', { name: /add to cart/i }).first().click();
  await page.goto('/checkout');

  await page.getByLabel(/first name/i).fill('Test');
  await page.getByLabel(/last name/i).fill('Buyer');
  await page.getByLabel(/phone number/i).fill('+6281234567890');
  await page.getByLabel(/street address/i).fill('Jl. Sudirman No. 21');
  await page.getByLabel(/^city/i).fill('Jakarta');
  await page.getByLabel(/zip code/i).fill('10220');
  const next = page.getByRole('button', { name: /continue to payment/i });
  await next.scrollIntoViewIfNeeded();
  await next.click();

  await page.getByText(/digital wallet/i).first().click();
  const review = page.getByRole('button', { name: /review order/i });
  await review.scrollIntoViewIfNeeded();
  await review.click();

  // Mobile renders the CTA in a sticky bottom bar, desktop in the summary card; pick whichever is visible.
  await page.locator('button:visible').filter({ hasText: /place order/i }).first().click();
  await expect(page.getByText(/order placed successfully/i)).toBeVisible({ timeout: 10_000 });
  await expect(page).toHaveURL(/\/orders/, { timeout: 15_000 });
});

test('chat: open a conversation and send a message', async ({ page }) => {
  await page.goto('/messages');
  // Conversation rows are buttons whose accessible name starts with the avatar alt (the contact's name).
  const thread = page.locator('button:visible').filter({ has: page.locator('img[alt]') }).first();
  await expect(thread).toBeVisible({ timeout: 15_000 });
  await thread.click();
  const composer = page.locator('textarea[placeholder]:visible').first();
  await expect(composer).toBeVisible();
  const text = `Hello from Playwright ${Date.now()}`;
  await composer.fill(text);
  await composer.press('Enter');
  // Both layouts (desktop two-pane + mobile stack) are in the DOM; assert on the visible instance.
  await expect(page.locator('p:visible', { hasText: text }).first()).toBeVisible();
});

test.describe('accessibility (axe-core, WCAG 2.2 A/AA)', () => {
  for (const path of ['/', '/shop', '/login', '/cart']) {
    test(`${path} has no serious/critical violations`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).exclude('[data-motion]').analyze();
      const serious = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map(v => `${v.id}: ${v.nodes.length}× ${v.help}`)).toEqual([]);
    });
  }
});

import { test, expect, signIn } from './fixtures';
import AxeBuilder from '@axe-core/playwright';

/** Full-funnel journeys against the production build on the mock API (or a real one via E2E_API_URL). */

test('auth: sign in with email and land on the home feed', async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole('navigation').first()).toBeVisible();
  // Session survives a reload through the (mock) refresh cookie: /orders is only reachable signed in.
  await page.reload();
  await page.goto('/orders');
  await expect(page.getByRole('heading', { name: /my orders/i })).toBeVisible();
  await expect(page.getByText(/EZ-\d+/).first()).toBeVisible({ timeout: 15_000 });
});

test('auth: validation blocks an empty submit and shows field errors', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await expect(page.getByText(/enter (a valid|your)/i).first()).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test('auth: wrong password surfaces the API error', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/^email/i).fill('buyer@ezyify.test');
  await page.getByLabel(/^password/i).fill('nope-nope');
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await expect(page.getByRole('alert')).toContainText(/incorrect/i);
});

test('commerce: browse → product → cart → coupon → three-step checkout → order success → orders', async ({ page }) => {
  await signIn(page);
  await page.goto('/product/prod-001');
  await page.locator('button:visible').filter({ hasText: /^add to cart$/i }).first().click();
  await expect(page.getByText(/added to cart/i).first()).toBeVisible();

  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: /your cart/i })).toBeVisible();
  await page.getByLabel(/promo code/i).fill('WELCOME10');
  await page.getByRole('button', { name: /^apply$/i }).click();
  await expect(page.getByText(/WELCOME10 applied/i)).toBeVisible();

  await page.locator('button:visible').filter({ hasText: /checkout/i }).first().click();
  await expect(page).toHaveURL(/\/checkout/);
  // Saved addresses come from the API; the default one is preselected.
  await expect(page.getByRole('radiogroup', { name: /saved addresses/i })).toBeVisible();
  await page.getByRole('button', { name: /continue to payment/i }).click();
  await page.getByText(/ezyify wallet/i).first().click();
  await page.getByRole('button', { name: /review order/i }).click();
  await expect(page.getByText(/deliver to/i)).toBeVisible();
  await page.locator('button:visible').filter({ hasText: /place order/i }).first().click();

  await expect(page).toHaveURL(/\/order-success\?orders=EZ-/, { timeout: 15_000 });
  await expect(page.getByText(/held in escrow/i).first()).toBeVisible();
  await page.getByRole('link', { name: /view my orders/i }).click();
  await expect(page.getByRole('heading', { name: /my orders/i })).toBeVisible();
  await expect(page.getByText(/EZ-\d+/).first()).toBeVisible();
});

test('orders: confirming delivery releases escrow', async ({ page }) => {
  await signIn(page);
  await page.goto('/orders');
  await page.getByRole('button', { name: /confirm delivery/i }).first().click();
  await page.getByRole('alertdialog').getByRole('button', { name: /confirm delivery/i }).click();
  await expect(page.getByText(/escrow released/i)).toBeVisible();
});

test('wallet: top up updates the balance and the ledger', async ({ page }) => {
  await signIn(page);
  await page.goto('/wallet');
  const before = await page.locator('p.tabular-nums').first().textContent();
  await page.getByRole('button', { name: /add funds/i }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: '$25' }).click();
  await page.getByRole('dialog').getByRole('button', { name: /add funds/i }).click();
  await expect(page.getByText(/\$25\.00 added/i)).toBeVisible();
  await expect(page.locator('p.tabular-nums').first()).not.toHaveText(before ?? '');
  await expect(page.getByText(/top up · card/i).first()).toBeVisible();
});

test('chat: open a conversation and send a message', async ({ page }) => {
  await signIn(page);
  await page.goto('/messages');
  const thread = page.getByRole('button', { name: /Maya Chen/ }).first();
  await expect(thread).toBeVisible({ timeout: 15_000 });
  await thread.click();
  await expect(page).toHaveURL(/[?&]c=/);
  const composer = page.locator('textarea[placeholder]:visible').first();
  await expect(composer).toBeVisible();
  const text = `Hello from Playwright ${Date.now()}`;
  await composer.fill(text);
  await composer.press('Enter');
  await expect(page.locator('p:visible', { hasText: text }).first()).toBeVisible({ timeout: 10_000 });
});

test('guest: cart is local and checkout asks to sign in', async ({ page }) => {
  await page.goto('/product/prod-003');
  await page.locator('button:visible').filter({ hasText: /^add to cart$/i }).first().click();
  await page.goto('/cart');
  await expect(page.getByText(/saved on this device/i)).toBeVisible();
  await page.locator('button:visible').filter({ hasText: /sign in to checkout|checkout/i }).first().click();
  await expect(page).toHaveURL(/\/login/);
});

test.describe('accessibility (axe-core, WCAG 2.2 A/AA)', () => {
  for (const path of ['/', '/shop', '/login', '/cart']) {
    test(`${path} has no serious/critical violations`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      // Entrance animations fade text in; sampling mid-fade yields false colour-contrast hits.
      // Only await finite animations — the decorative floats loop forever.
      await page.evaluate(() =>
        Promise.all(
          document
            .getAnimations()
            .filter(a => Number.isFinite(Number(a.effect?.getComputedTiming().endTime ?? Infinity)))
            .map(a => a.finished.catch(() => undefined)),
        ),
      );
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).exclude('[data-motion]').analyze();
      const serious = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map(v => `${v.id}: ${v.nodes.length}× ${v.help}`)).toEqual([]);
    });
  }
});

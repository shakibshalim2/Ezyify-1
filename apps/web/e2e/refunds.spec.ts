import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

const signIn = async (page: Page, email: string) => {
  await page.goto('/login');
  await page.getByLabel(/^email/i).fill(email);
  await page.getByLabel(/^password/i).fill('Password1');
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/(two-factor)?$/, { timeout: 15_000 });
};
/** Drops the client session only; the per-tab mock snapshot (orders, cases) survives. */
const switchUser = async (page: Page, email: string) => {
  await page.evaluate(() => { window.localStorage.removeItem('ezyify.session'); window.localStorage.removeItem('ezyify.mock.refresh'); });
  await signIn(page, email);
};

test.describe('refund cases on /orders/:id/refund + /admin/disputes', () => {
  // Five sign-ins across three roles in one tab; give it headroom over the 30s default.
  test.setTimeout(60_000);
  test('buyer requests → seller declines → buyer escalates → admin refunds; wallet and statuses follow', async ({ page }) => {
    // Fixture o1 (EZ-10422, fashion, out_for_delivery) belongs to the buyer.
    await signIn(page, 'buyer@ezyify.test');
    await page.goto('/orders');
    await expect(page.getByText('EZ-10422')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('link', { name: /problem with order/i }).first().click();
    await expect(page).toHaveURL(/\/orders\/o1\/refund\/new$/);

    // Validation before any request.
    await page.getByRole('button', { name: /send refund request/i }).click();
    await expect(page.getByRole('alert')).toContainText(/pick a reason/i);
    await page.getByRole('radio', { name: /arrived damaged/i }).click();
    await page.getByRole('checkbox', { name: /include/i }).first().uncheck(); // deselect the only item
    await page.getByRole('button', { name: /send refund request/i }).click();
    await expect(page.getByRole('alert')).toContainText(/at least one item/i);
    await page.getByRole('checkbox', { name: /include/i }).first().check();
    await page.getByLabel(/tell the seller more/i).fill('Zip broke on first use');
    await page.getByRole('button', { name: /send refund request/i }).click();

    await expect(page).toHaveURL(/\/orders\/o1\/refund$/, { timeout: 15_000 });
    await expect(page.getByTestId('refund-stage-pending')).toBeVisible();
    await expect(page.getByText(/arrived damaged — zip broke on first use/i)).toBeVisible();

    // Seller declines with a note from the seller hub.
    await switchUser(page, 'fashion@ezyify.test');
    await page.goto('/seller/orders');
    const sellerCard = page.getByTestId('seller-order-o1');
    await expect(sellerCard).toBeVisible({ timeout: 15_000 });
    await sellerCard.getByRole('button', { name: /^decline$/i }).click();
    await page.getByLabel(/your response/i).fill('Bag was inspected and photographed before dispatch');
    await page.getByRole('button', { name: /decline refund/i }).click();
    await expect(sellerCard.getByRole('button', { name: /^decline$/i })).toHaveCount(0, { timeout: 15_000 });

    // Buyer sees the decline, escalates.
    await switchUser(page, 'buyer@ezyify.test');
    await page.goto('/orders?filter=refunds');
    await page.getByRole('link', { name: /seller declined · respond/i }).click();
    await expect(page.getByTestId('refund-stage-declined')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/inspected and photographed/i)).toBeVisible();
    await page.getByRole('button', { name: /escalate to ezyify/i }).click();
    await page.getByLabel(/your side/i).fill('short');
    await page.getByRole('button', { name: /open dispute/i }).click();
    await expect(page.getByRole('alert')).toContainText(/more detail/i);
    await page.getByLabel(/your side/i).fill('The seller ignores the photos I sent on delivery day; the zip is clearly torn.');
    await page.getByRole('button', { name: /open dispute/i }).click();
    await expect(page.getByTestId('refund-stage-disputed')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /escalate to ezyify/i })).toHaveCount(0);

    // Admin resolves in the buyer's favour.
    await switchUser(page, 'admin@ezyify.test');
    await page.goto('/admin/disputes');
    const dispute = page.getByTestId('dispute-o1');
    await expect(dispute).toBeVisible({ timeout: 15_000 });
    await expect(dispute).toContainText(/zip broke/i);
    await expect(dispute).toContainText(/inspected and photographed/i);
    await dispute.getByRole('button', { name: /refund buyer/i }).click();
    await expect(page.getByRole('button', { name: /^refund buyer$/i }).last()).toBeDisabled();
    await page.getByLabel(/decision note/i).fill('Delivery-day photos show the damage; refund approved.');
    await page.getByRole('button', { name: /^refund buyer$/i }).last().click();
    await expect(page.getByTestId('dispute-o1')).toHaveCount(0, { timeout: 15_000 });
    await expect(page.getByText(/no open disputes/i)).toBeVisible();

    // Buyer sees the verdict and the wallet credit.
    await switchUser(page, 'buyer@ezyify.test');
    await page.goto('/orders/o1/refund');
    await expect(page.getByTestId('refund-stage-refunded')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/delivery-day photos show the damage/i)).toBeVisible();
    await page.goto('/wallet');
    await expect(page.getByText(/refund · EZ-10422/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test('withdrawing a request resumes the order; legacy refund URLs redirect', async ({ page }) => {
    await signIn(page, 'buyer@ezyify.test');
    await page.goto('/orders/o1/refund/new');
    await page.getByRole('radio', { name: /changed my mind/i }).click();
    await page.getByRole('button', { name: /send refund request/i }).click();
    await expect(page.getByTestId('refund-stage-pending')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /withdraw request/i }).click();
    await page.getByRole('button', { name: /^withdraw$/i }).click();
    await expect(page.getByTestId('refund-stage-withdrawn')).toBeVisible({ timeout: 15_000 });
    await page.goto('/orders');
    await expect(page.getByText('EZ-10422')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/out for delivery/i).first()).toBeVisible();

    await page.goto('/orders/refund-request?orderId=ORD-12345');
    await expect(page).toHaveURL(/\/orders$/, { timeout: 15_000 });
    await page.goto('/user/refund-history');
    await expect(page).toHaveURL(/\/orders\?filter=refunds$/, { timeout: 15_000 });
  });
});

import { test, expect, signIn } from './fixtures';

test.describe('buyer order tracking on GET /orders/:id + /timeline', () => {
  test('shows real status, carrier tracking, items, escrow; confirming delivery releases escrow', async ({ page }) => {
    await signIn(page);
    await page.goto('/orders');
    await page.getByTestId('order-link-o1').click();
    await expect(page).toHaveURL(/\/orders\/o1$/);

    // Fixture o1: out_for_delivery via J&T, held in escrow, one backpack.
    await expect(page.getByRole('heading', { name: 'EZ-10422' })).toBeVisible({ timeout: 15_000 });
    const stepper = page.getByTestId('tracking-stepper');
    await expect(stepper.getByRole('listitem').filter({ hasText: /^shipped$/i })).toHaveAttribute('aria-current', 'step');
    await expect(page.getByTestId('tracking-carrier')).toContainText('JT8842019921');
    await expect(page.getByTestId('tracking-carrier').getByRole('link', { name: /track with j&t/i })).toHaveAttribute('href', /jet\.co\.id/);
    await expect(page.getByText(/leather everyday backpack/i).first()).toBeVisible();
    await expect(page.getByTestId('tracking-escrow')).toContainText(/held safely/i);
    await expect(page.getByTestId('tracking-timeline').getByRole('listitem').first()).toContainText(/out for delivery/i);
    // No fixture leftovers from the Figma page.
    await expect(page.getByText(/premium wireless headphones/i)).toHaveCount(0);

    await page.getByRole('button', { name: /confirm delivery/i }).click();
    await page.getByRole('button', { name: /release payment/i }).click();
    await expect(page.getByTestId('tracking-escrow')).toContainText(/released to the seller/i, { timeout: 15_000 });
    await expect(stepper.getByRole('listitem').filter({ hasText: /^complete$/i })).toHaveAttribute('aria-current', 'step');
    await expect(page.getByRole('button', { name: /confirm delivery/i })).toHaveCount(0);
  });

  test('refund-requested orders show the case banner; legacy tracking URLs redirect', async ({ page }) => {
    await signIn(page);
    await page.goto('/user/order-tracking/o4');
    await expect(page).toHaveURL(/\/orders\/o4$/, { timeout: 15_000 });
    await expect(page.getByTestId('tracking-banner')).toContainText(/refund requested/i, { timeout: 15_000 });
    await page.getByRole('link', { name: /view case/i }).click();
    await expect(page).toHaveURL(/\/orders\/o4\/refund$/);

    await page.goto('/user/order-tracking');
    await expect(page).toHaveURL(/\/orders$/, { timeout: 15_000 });
    await page.goto('/orders/does-not-exist');
    await expect(page.getByText(/not found/i).first()).toBeVisible({ timeout: 15_000 });
  });
});

import { test, expect } from './fixtures';

test.describe('seller hub · analytics on GET /seller/analytics', () => {
  test('range selector refetches; totals, top products, category mix and fulfilment render from the API', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/^email/i).fill('techstore@ezyify.test');
    await page.getByLabel(/^password/i).fill('Password1');
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/\/(two-factor|welcome)?$/, { timeout: 15_000 });

    await page.goto('/seller/analytics');
    await expect(page.getByRole('heading', { name: /^analytics$/i })).toBeVisible({ timeout: 15_000 });
    const totals = page.getByTestId('analytics-totals');
    await expect(totals).toContainText(/gross sales/i, { timeout: 15_000 });
    await expect(totals).toContainText(/\$[\d.,]+[KM]?/);
    // No placeholder figures from the old fixture page.
    await expect(page.getByText('$12,450')).toHaveCount(0);
    await expect(page.getByText(/store views/i)).toHaveCount(0);

    const top = page.getByTestId('analytics-top-products');
    await expect(top).toContainText(/wireless noise-cancelling headphones/i);
    await expect(top).toContainText(/smart watch series 7/i);
    // techstore only sells Tech — the category mix reflects that.
    await expect(page.getByRole('img', { name: /sales by category/i })).toHaveAccessibleName(/tech 100%/i);
    await expect(page.getByTestId('analytics-fulfillment')).toContainText(/completed/i);

    const before = await totals.textContent();
    await page.getByRole('button', { name: /^7 days$/i }).click();
    await expect(page.getByRole('button', { name: /^7 days$/i })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText(/last 7 days/i)).toBeVisible();
    await expect.poll(async () => totals.textContent()).not.toBe(before);
  });
});

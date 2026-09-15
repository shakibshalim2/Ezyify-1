import { test, expect } from './fixtures';

test.describe('seller hub · overview on GET /seller/dashboard', () => {
  test('KPIs, attention alerts, chart and recent orders come from the API', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/^email/i).fill('techstore@ezyify.test');
    await page.getByLabel(/^password/i).fill('Password1');
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/\/(two-factor|welcome)?$/, { timeout: 15_000 });

    await page.goto('/seller-dashboard');
    await expect(page.getByRole('heading', { name: /^overview$/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/welcome back, techstore/i)).toBeVisible({ timeout: 15_000 });

    const gross = page.getByTestId('kpi-gross');
    await expect(gross).toContainText(/\$[\d,]+/);
    await expect(gross).toContainText(/% *vs|no prior period/i);
    await expect(page.getByTestId('kpi-escrow')).toContainText('$79.99');

    // Attention alerts are computed from live order state: o2 is "processing" for techstore.
    await expect(page.getByRole('list', { name: /needs attention/i })).toContainText(/1 order needs accepting or shipping/i);
    await expect(page.getByRole('img', { name: /daily gross sales for the last 14 days/i })).toBeVisible();
    await expect(page.getByTestId('dash-order-o2')).toContainText(/test buyer/i);

    // Sidebar figures are real too — no "$48,200" placeholder anywhere.
    await expect(page.getByText('$48,200')).toHaveCount(0);
    await expect(page.getByText(/TechHub Store/)).toHaveCount(0);
    await expect(page.getByText(/last 30 days/i).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /orders/i }).filter({ hasText: /^Orders1$/ }).first()).toBeVisible();
  });
});

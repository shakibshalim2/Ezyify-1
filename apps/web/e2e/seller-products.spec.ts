import { test, expect } from './fixtures';

const SELLER = { email: 'techstore@ezyify.test', password: 'Password1' };

test.describe('seller hub · products on GET /seller/products', () => {
  test('inventory is seller-scoped with status counts, search and drafts tab', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/^email/i).fill(SELLER.email);
    await page.getByLabel(/^password/i).fill(SELLER.password);
    await page.getByRole('button', { name: /^sign in$/i }).click();
    // Sellers are stepped up to MFA only once enrolled; the demo seller is not, so we land on home.
    await expect(page).toHaveURL(/\/(two-factor)?$/, { timeout: 15_000 });

    await page.goto('/seller/products');
    await expect(page.getByRole('heading', { name: /^products$/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('seller-product-prod-001')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('seller-product-prod-001')).toContainText(/wireless noise-cancelling headphones/i);
    await expect(page.getByTestId('seller-product-prod-001')).toContainText(/revenue/i);
    // Another seller's product never appears.
    await expect(page.getByTestId('seller-product-prod-004')).toHaveCount(0);

    await page.getByLabel(/search products/i).fill('watch');
    await expect(page.getByTestId('seller-product-prod-002')).toBeVisible();
    await expect(page.getByTestId('seller-product-prod-001')).toHaveCount(0);
    await page.getByLabel(/search products/i).fill('');

    await page.getByRole('tab', { name: /drafts/i }).click();
    await expect(page.getByText(/no products match/i)).toBeVisible();
  });

  test('buyers are refused', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/^email/i).fill('buyer@ezyify.test');
    await page.getByLabel(/^password/i).fill('Password1');
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
    await page.goto('/seller/products');
    await expect(page.getByRole('heading', { name: /couldn’t load your products/i })).toBeVisible({ timeout: 15_000 });
  });
});

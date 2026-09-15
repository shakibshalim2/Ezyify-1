import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

const SELLER = { email: 'techstore@ezyify.test', password: 'Password1' };
// 1×1 PNG — enough for the mock bucket, which only records the PUT.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

async function signInSeller(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/^email/i).fill(SELLER.email);
  await page.getByLabel(/^password/i).fill(SELLER.password);
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/(two-factor)?$/, { timeout: 15_000 });
}

test.describe('seller hub · add / edit / delete product on /seller/products', () => {
  test('creates a draft with an uploaded photo, publishes it from the editor, then deletes it', async ({ page }) => {
    await signInSeller(page);

    await page.goto('/seller/add-product');
    await expect(page.getByRole('heading', { name: /^add product$/i })).toBeVisible({ timeout: 15_000 });

    // Client-side validation blocks an empty submit and shows every problem at once.
    await page.getByRole('button', { name: /publish product/i }).click();
    await expect(page.getByText(/add at least one image/i).first()).toBeVisible();
    await expect(page.getByLabel(/product name/i)).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByLabel(/selling price/i)).toHaveAttribute('aria-invalid', 'true');

    await page.getByLabel(/product photos/i).setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: PNG });
    await expect(page.getByTestId('product-image-0')).toBeVisible({ timeout: 15_000 });

    const name = `Playwright Desk Mat ${Date.now().toString(36)}`;
    await page.getByLabel(/product name/i).fill(name);
    await page.getByLabel(/^description/i).fill('Vegan leather desk mat, 80×40 cm, stitched edges, non-slip base.');
    await page.getByRole('combobox', { name: /category/i }).click();
    await page.getByRole('option', { name: /^home$/i }).click();
    await page.getByLabel(/selling price/i).fill('29.99');
    await page.getByLabel(/compare-at price/i).fill('19.99');
    await page.getByLabel(/^stock/i).fill('7');
    await page.getByLabel(/^published$/i).click(); // → draft
    await expect(page.getByRole('button', { name: /save draft/i })).toBeVisible();

    // Cross-field rule (shared zod schema) surfaces inline before any request.
    await page.getByRole('button', { name: /save draft/i }).click();
    await expect(page.getByLabel(/compare-at price/i)).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText(/compare-at price must be higher/i).first()).toBeVisible();
    await page.getByLabel(/compare-at price/i).fill('39.99');
    await page.getByRole('button', { name: /save draft/i }).click();

    await expect(page).toHaveURL(/\/seller\/products$/, { timeout: 15_000 });
    await page.getByRole('tab', { name: /drafts/i }).click();
    const row = page.locator('[data-testid^="seller-product-"]', { hasText: name });
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect(row).toContainText(/hidden from shoppers/i);

    // Edit → publish; the low-stock tab then owns it (7 < 10).
    await row.getByRole('link', { name: new RegExp(`edit ${name}`, 'i') }).click();
    await expect(page.getByRole('heading', { name: /^edit product$/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByLabel(/product name/i)).toHaveValue(name);
    await expect(page.getByLabel(/selling price/i)).toHaveValue('29.99');
    await page.getByLabel(/^published$/i).click();
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page).toHaveURL(/\/seller\/products$/, { timeout: 15_000 });
    await page.getByRole('tab', { name: /^low/i }).click();
    await expect(page.locator('[data-testid^="seller-product-"]', { hasText: name })).toBeVisible({ timeout: 15_000 });

    // Delete (never ordered → removed outright).
    await page.locator('[data-testid^="seller-product-"]', { hasText: name }).getByRole('link', { name: /^edit/i }).click();
    await page.getByRole('button', { name: /delete product/i }).click();
    await expect(page.getByRole('alertdialog')).toContainText(/permanently removes/i);
    await page.getByRole('alertdialog').getByRole('button', { name: /^delete$/i }).click();
    await expect(page).toHaveURL(/\/seller\/products$/, { timeout: 15_000 });
    await page.getByLabel(/search products/i).fill('Playwright Desk Mat');
    await expect(page.getByText(/no products match/i)).toBeVisible({ timeout: 15_000 });
  });

  test('editing a product from another store is a 404, not a leak', async ({ page }) => {
    await signInSeller(page);
    await page.goto('/seller/edit-product/prod-004'); // Fashion Hub's backpack
    await expect(page.getByRole('heading', { name: /couldn’t load this product/i })).toBeVisible({ timeout: 15_000 });
  });
});

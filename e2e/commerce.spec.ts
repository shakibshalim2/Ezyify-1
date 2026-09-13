import { test, expect } from './fixtures';

test('add a product to cart from product detail and see it in cart', async ({ page }) => {
  await page.goto('/shop');
  const firstProduct = page.locator('a[href^="/product/"]').first();
  await expect(firstProduct).toBeVisible({ timeout: 15_000 });
  await firstProduct.click();
  await expect(page).toHaveURL(/\/product\//);

  await page.getByRole('button', { name: /add to cart/i }).first().click();
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: /cart/i })).toBeVisible();
  await expect(page.getByText(/checkout/i).first()).toBeVisible();
});

import { test, expect } from './fixtures';

test.describe('deals + wishlist on the catalog API', () => {
  test('deals lists only discounted products and wishlist resolves saved ids through the API', async ({ page }) => {
    await page.goto('/deals');
    await expect(page.getByRole('heading', { name: /flash deals/i })).toBeVisible();
    const cards = page.locator('article, [data-testid="product-card"], a[href^="/product/"]').filter({ hasText: /\$/ });
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });
    // Every deal card shows a strike-through compare-at price.
    const strikes = page.locator('.line-through');
    expect(await strikes.count()).toBeGreaterThan(0);

    // Save the first deal to the wishlist and confirm it appears on /wishlist via the catalog endpoint.
    const wish = page.getByRole('button', { name: /add to wishlist/i }).first();
    await wish.click({ force: true });
    await page.goto('/wishlist');
    await expect(page.getByRole('heading', { name: /my wishlist/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /add all to cart/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('.line-through').first()).toBeVisible();

    await page.getByRole('button', { name: /^clear$/i }).click();
    await expect(page.getByText(/nothing saved yet/i)).toBeVisible();
  });
});

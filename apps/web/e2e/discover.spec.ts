import { test, expect } from './fixtures';

test.describe('discovery surfaces', () => {
  test('Explore renders API-backed products and creators', async ({ page }) => {
    await page.goto('/explore');
    await expect(page.getByText('Wireless Noise-Cancelling Headphones')).toBeVisible();
    await expect(page.getByText('@glow.with.sara')).toBeVisible();
  });

  test('searches catalog products and people through unified search', async ({ page }) => {
    await page.goto('/search?q=headphones');
    await expect(page.getByText('Wireless Noise-Cancelling Headphones')).toBeVisible();

    await page.goto('/search?q=sara');
    await page.getByRole('button', { name: 'People' }).click();
    await expect(page.getByText('Sara Kim')).toBeVisible();
  });

  test('loads seller identity and catalog from the API', async ({ page }) => {
    await page.goto('/seller/techstore');
    await expect(page.getByRole('heading', { name: 'TechStore' })).toBeVisible();
    await expect(page.getByText('Wireless Noise-Cancelling Headphones')).toBeVisible();
  });
});

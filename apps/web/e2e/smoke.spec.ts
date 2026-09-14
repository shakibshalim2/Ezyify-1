import { test, expect } from './fixtures';

const routes = [
  ['/shop', /shop/i],
  ['/explore', /explore/i],
  ['/cart', /cart/i],
  ['/orders', /orders/i],
  ['/wallet', /wallet/i],
  ['/settings', /settings/i],
  ['/seller-dashboard', /overview|dashboard/i],
  ['/live-shopping', /live/i],
] as const;

for (const [path, heading] of routes) {
  test(`renders ${path} without page errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto(path);
    await expect(page.locator('h1, h2').filter({ hasText: heading }).first()).toBeVisible({ timeout: 15_000 });
    expect(errors, `page errors on ${path}`).toEqual([]);
  });
}

test('home renders the feed shell without page errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('navigation').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('main, [data-slot="page"], #root').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('unknown route shows the 404 page', async ({ page }) => {
  await page.goto('/definitely-not-a-route');
  await expect(page.getByText(/404|not found/i).first()).toBeVisible();
});

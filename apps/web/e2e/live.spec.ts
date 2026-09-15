import { test, expect, signIn } from './fixtures';

test('live hub lists live and upcoming sessions and can set a reminder', async ({ page }) => {
  await page.goto('/live-shopping');

  await expect(page.getByRole('heading', { name: /live now/i })).toBeVisible();
  await expect(page.getByText('Glass-skin routine, step by step')).toBeVisible();
  await expect(page.getByRole('heading', { name: /upcoming/i })).toBeVisible();
  await expect(page.getByText('Derm-approved evening skincare')).toBeVisible();

  await page
    .getByRole('button', { name: /^remind$/i })
    .first()
    .click();
  await expect(page.getByRole('button', { name: /^reminding$/i }).first()).toBeVisible();
});

test('live viewer shows API host, pinned product, and adds it to cart', async ({ page }) => {
  await signIn(page);
  await page.goto('/live/live-001');

  await expect(page.getByText('@techstore')).toBeVisible();
  await expect(page.getByText('LIVE', { exact: true })).toBeVisible();
  await expect(page.getByText('Wireless Noise-Cancelling Headphones')).toBeVisible({
    timeout: 15_000,
  });
  await page.getByRole('button', { name: /buy wireless noise-cancelling headphones/i }).click();
  await expect(page.getByText('Added to cart')).toBeVisible();
});

test('scheduled live session shows its start state', async ({ page }) => {
  await page.goto('/live/live-004');

  await expect(page.getByText('UPCOMING LIVE')).toBeVisible();
  await expect(page.getByText(/starts in/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /remind me/i })).toBeVisible();
});

test('unknown live session shows the not-found state', async ({ page }) => {
  await page.goto('/live/nope');

  await expect(page.getByRole('heading', { name: 'Live stream not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: /browse live shopping/i })).toBeVisible();
});

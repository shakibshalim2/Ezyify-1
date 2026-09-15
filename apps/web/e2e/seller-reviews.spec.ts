import { test, expect } from './fixtures';

const signIn = async (page: import('@playwright/test').Page, email: string) => {
  await page.goto('/login');
  await page.getByLabel(/^email/i).fill(email);
  await page.getByLabel(/^password/i).fill('Password1');
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/(two-factor|welcome)?$/, { timeout: 15_000 });
};

test.describe('reviews · buyer posts, seller replies', () => {
  test('product page lists real reviews and a buyer can post one', async ({ page }) => {
    await signIn(page, 'buyer@ezyify.test');
    await page.goto('/product/prod-001');
    await expect(page.getByRole('heading', { name: /customer reviews/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('review-rev-001')).toContainText(/maya chen/i, { timeout: 15_000 });
    await expect(page.getByTestId('review-rev-002')).toContainText(/seller reply/i);
    await expect(page.getByText(/verified purchase/i).first()).toBeVisible();

    await page.getByRole('button', { name: /write a review/i }).click();
    await page.getByRole('button', { name: /post review/i }).click();
    await expect(page.getByRole('alert')).toContainText(/pick a star rating/i);
    await page.getByRole('radio', { name: /^5 stars$/i }).click();
    await page.getByPlaceholder(/what did you like/i).fill('Bass is deep without mud. Great buy.');
    await page.getByRole('button', { name: /post review/i }).click();
    await expect(page.getByText(/bass is deep without mud/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /write a review/i })).toHaveCount(0);
  });

  test('seller hub shows only own-product reviews, filters, and posts a public reply', async ({ page }) => {
    await signIn(page, 'techstore@ezyify.test');
    await page.goto('/seller/reviews');
    await expect(page.getByRole('heading', { name: /^reviews$/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('reviews-stats')).toContainText(/awaiting reply/i, { timeout: 15_000 });
    await expect(page.getByTestId('seller-review-rev-003')).toBeVisible({ timeout: 15_000 });
    // fashion's backpack review never appears for techstore.
    await expect(page.getByTestId('seller-review-rev-004')).toHaveCount(0);
    // Old fixture rows are gone.
    await expect(page.getByText(/ahmed hassan/i)).toHaveCount(0);

    await page.getByRole('button', { name: /3★ and below/i }).click();
    await expect(page.getByTestId('seller-review-rev-003')).toBeVisible();
    await expect(page.getByTestId('seller-review-rev-001')).toHaveCount(0);

    const card = page.getByTestId('seller-review-rev-003');
    await card.getByRole('button', { name: /^reply$/i }).click();
    await card.getByRole('button', { name: /post reply/i }).click();
    await expect(card.getByRole('alert')).toContainText(/write a short reply/i);
    await card.getByPlaceholder(/reply publicly/i).fill('Sorry Dan — a new clasp is on its way to you, free.');
    await card.getByRole('button', { name: /post reply/i }).click();
    await expect(card).toContainText(/your reply/i, { timeout: 10_000 });
    await expect(card).toContainText(/new clasp is on its way/i);
    await expect(card.getByRole('button', { name: /^reply$/i })).toHaveCount(0);
  });
});

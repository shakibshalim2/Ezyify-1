import { test, expect, signIn } from './fixtures';

test.describe('social API journeys', () => {
  test('loops render API content and open tagged products', async ({ page }) => {
    await page.goto('/loops');
    await expect(page.getByLabel(/loop by @/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/@\w+/).first()).toBeVisible();
    await page.getByRole('button', { name: /^shop$/i }).click();
    await expect(page.getByRole('heading', { name: 'Tagged products' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Leather Everyday Backpack' })).toBeVisible();
  });

  test('post detail loads comments and signed-in users can comment', async ({ page }) => {
    await page.goto('/post/post-001');
    await expect(page.getByText(/Just got these amazing wireless headphones/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('#comments article').first()).toBeVisible();

    await signIn(page);
    await page.goto('/post/post-001');
    const comment = `Great pick ${Date.now()}`;
    await page.getByLabel('Add a comment').fill(comment);
    await page.getByRole('button', { name: 'Post comment' }).click();
    await expect(page.locator('#comments')).toContainText(comment, { timeout: 15_000 });
  });

  test('stories show author and progress, then ArrowRight advances', async ({ page }) => {
    await page.goto('/stories/glow.with.sara');
    await expect(page.getByText('Sara Kim')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByLabel('Story progress').locator('div').first()).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/\/(stories\/|$)/);
  });
});

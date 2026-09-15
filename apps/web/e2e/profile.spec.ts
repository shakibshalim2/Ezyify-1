import { test, expect, signIn } from './fixtures';

test.describe('profile on the real API', () => {
  test('public profile renders API data with follow + tabs; own profile shows saved tab', async ({ page }) => {
    await page.goto('/profile/glow.with.sara');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Sara Kim/, { timeout: 15_000 });
    await expect(page.getByText(/@glow.with.sara/)).toBeVisible();
    await expect(page.getByRole('button', { name: /^follow$/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /posts/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /saved/i })).toHaveCount(0);

    // Follow requires auth → redirected to login, then back.
    await page.getByRole('button', { name: /^follow$/i }).click();
    await expect(page).toHaveURL(/\/login/);

    await signIn(page);
    await page.goto('/profile/glow.with.sara');
    // The demo buyer may already follow this creator — toggle and expect the opposite state (optimistic update).
    const toggle = page.getByRole('button', { name: /^(follow|following)$/i });
    const wasFollowing = /following/i.test((await toggle.textContent()) ?? '');
    await toggle.click();
    await expect(page.getByRole('button', { name: wasFollowing ? /^follow$/i : /^following$/i })).toBeVisible();

    await page.goto('/profile/me');
    await expect(page.getByRole('tab', { name: /saved/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('link', { name: /edit profile/i })).toBeVisible();
  });
});

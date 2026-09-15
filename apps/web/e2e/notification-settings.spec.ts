import { test, expect, signIn } from './fixtures';

test.describe('notification preferences on /users/me/notification-preferences', () => {
  test('defaults come from the API, toggles persist across reload, bulk switches update every row', async ({ page }) => {
    await signIn(page);
    await page.goto('/settings/notifications');
    await expect(page.getByRole('heading', { name: /^notifications$/i })).toBeVisible({ timeout: 15_000 });

    // Shared defaults: orders push+email on, promos both off.
    const ordersEmail = page.getByRole('switch', { name: /orders & escrow email/i });
    const promosPush = page.getByRole('switch', { name: /deals & promotions push/i });
    await expect(ordersEmail).toHaveAttribute('aria-checked', 'true', { timeout: 15_000 });
    await expect(promosPush).toHaveAttribute('aria-checked', 'false');
    // No trace of the localStorage-era keys.
    await expect(page.getByText(/newsletter/i)).toHaveCount(0);

    await promosPush.click();
    await expect(promosPush).toHaveAttribute('aria-checked', 'true');
    await ordersEmail.click();
    await expect(ordersEmail).toHaveAttribute('aria-checked', 'false');
    // Bulk switches are disabled while a save is in flight; wait for the last PATCH to land before reloading.
    await expect(page.getByRole('switch', { name: /toggle all email notifications/i })).toBeEnabled({ timeout: 15_000 });

    await page.reload();
    await expect(page.getByRole('switch', { name: /deals & promotions push/i })).toHaveAttribute('aria-checked', 'true', { timeout: 15_000 });
    await expect(page.getByRole('switch', { name: /orders & escrow email/i })).toHaveAttribute('aria-checked', 'false');

    await page.getByRole('switch', { name: /toggle all email notifications/i }).click();
    for (const name of [/orders & escrow email/i, /messages email/i, /deals & promotions email/i]) {
      await expect(page.getByRole('switch', { name })).toHaveAttribute('aria-checked', 'true', { timeout: 15_000 });
    }
  });

  test('signed-out visitors are sent to login', async ({ page }) => {
    await page.goto('/settings/notifications');
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});

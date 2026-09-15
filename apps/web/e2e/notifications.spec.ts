import { test, expect, signIn } from './fixtures';

test.describe('notifications on GET /notifications', () => {
  test('lists real notifications grouped by day, filters by type, marks read and updates the nav badge', async ({ page }) => {
    await signIn(page);
    await page.goto('/notifications');
    await expect(page.getByRole('heading', { name: /^notifications/i })).toBeVisible({ timeout: 15_000 });

    // Fixture data: n1 (order, unread) + n2 (like, unread) → badge "2" in the heading and the nav.
    await expect(page.getByRole('heading', { name: /^notifications/i })).toContainText('2');
    const n1 = page.getByTestId('notification-n1');
    await expect(n1).toBeVisible();
    await expect(n1).toContainText(/out for delivery/i);
    await expect(n1).toHaveAttribute('data-unread', 'true');
    await expect(page.getByRole('heading', { name: /^today$/i })).toBeVisible();
    // No placeholder copy from the old fixture.
    await expect(page.getByText(/order #12345/i)).toHaveCount(0);

    await page.getByRole('tab', { name: /^social$/i }).click();
    await expect(page.getByTestId('notification-n2')).toBeVisible();
    await expect(page.getByTestId('notification-n1')).toHaveCount(0);
    await page.getByRole('tab', { name: /^all$/i }).click();

    // Opening an unread notification marks it read server-side and navigates to its target.
    await n1.getByRole('link').click();
    await expect(page).toHaveURL(/\/orders$/, { timeout: 15_000 });
    await page.goto('/notifications');
    await expect(page.getByTestId('notification-n1')).not.toHaveAttribute('data-unread', 'true', { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /^notifications/i })).toContainText('1');

    await page.getByRole('button', { name: /mark all read/i }).click();
    await expect(page.getByRole('button', { name: /mark all read/i })).toHaveCount(0, { timeout: 15_000 });
    await expect(page.getByTestId('notification-n2')).not.toHaveAttribute('data-unread', 'true');
  });

  test('signed-out visitors are sent to login', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});

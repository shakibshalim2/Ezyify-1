import { test, expect, signIn } from './fixtures';

test.describe('settings hub, privacy, account and security on the API', () => {
  test('hub reflects live account state; private account hides followers from others; addresses CRUD', async ({ page }) => {
    await signIn(page);
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /^settings$/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('settings-email')).toContainText('buyer@ezyify.test', { timeout: 15_000 });
    await expect(page.getByTestId('settings-security')).toContainText(/two-factor off/i);
    await expect(page.getByTestId('settings-privacy')).toContainText(/public account/i);
    // No leftovers from the Figma-era placeholder.
    await expect(page.getByText(/john@example\.com/i)).toHaveCount(0);

    await page.getByRole('link', { name: /^privacy public account/i }).click();
    await expect(page).toHaveURL(/\/settings\/privacy$/);
    await expect(page.getByTestId('blocked-empty')).toBeVisible({ timeout: 15_000 });
    await page.getByTestId('private-account-switch').click();
    await expect(page.getByTestId('private-account-switch')).toHaveAttribute('aria-checked', 'true', { timeout: 15_000 });
    await page.goto('/settings');
    await expect(page.getByTestId('settings-privacy')).toContainText(/private account/i, { timeout: 15_000 });

    // Another user can no longer open the buyer's followers list.
    await page.evaluate(() => { window.localStorage.removeItem('ezyify.session'); window.localStorage.removeItem('ezyify.mock.refresh'); });
    await page.goto('/login');
    await page.getByLabel(/^email/i).fill('techstore@ezyify.test');
    await page.getByLabel(/^password/i).fill('Password1');
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/\/(two-factor)?$/, { timeout: 15_000 });
    await page.goto('/profile/buyer/followers');
    await expect(page.getByText(/this account is private/i).first()).toBeVisible({ timeout: 15_000 });

    // Back as the buyer: account page shows real contact details and address CRUD.
    await page.evaluate(() => { window.localStorage.removeItem('ezyify.session'); window.localStorage.removeItem('ezyify.mock.refresh'); });
    await signIn(page);
    await page.goto('/settings/account-management');
    await expect(page.getByTestId('account-email')).toHaveText('buyer@ezyify.test', { timeout: 15_000 });
    const before = await page.locator('[data-testid^="address-"]').count();
    await page.getByRole('button', { name: /^add$/i }).click();
    await page.getByLabel(/^label/i).fill('Studio');
    await page.getByLabel(/^recipient/i).fill('Test Buyer');
    await page.getByLabel(/phone number/i).fill('+62 812 0000 1111');
    await page.getByLabel(/street address/i).fill('Jl. Thamrin 9');
    await page.getByLabel(/^city/i).fill('Jakarta');
    await page.getByLabel(/postal code/i).fill('10230');
    await page.getByRole('button', { name: /save address/i }).click();
    await expect(page.locator('[data-testid^="address-"]')).toHaveCount(before + 1, { timeout: 15_000 });
    await expect(page.getByText(/jl\. thamrin 9/i)).toBeVisible();
    await page.getByRole('button', { name: /remove studio address/i }).click();
    await expect(page.locator('[data-testid^="address-"]')).toHaveCount(before, { timeout: 15_000 });
  });

  test('change password re-authenticates and the new password works', async ({ page }) => {
    await signIn(page);
    await page.goto('/settings/security');
    await page.getByRole('button', { name: /^change$/i }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/current password/i).fill('Wrong1234');
    await dialog.getByLabel(/^new password/i).fill('Newpass123');
    await dialog.getByLabel(/confirm new password/i).fill('Newpass123');
    await dialog.getByRole('button', { name: /change password/i }).click();
    await expect(dialog.getByLabel(/current password/i)).toHaveAttribute('aria-invalid', 'true', { timeout: 15_000 });
    await dialog.getByLabel(/current password/i).fill('Password1');
    await dialog.getByLabel(/^new password/i).fill('weak');
    await dialog.getByLabel(/confirm new password/i).fill('weak');
    await dialog.getByRole('button', { name: /change password/i }).click();
    await expect(dialog.getByLabel(/^new password/i)).toHaveAttribute('aria-invalid', 'true');
    await dialog.getByLabel(/^new password/i).fill('Newpass123');
    await dialog.getByLabel(/confirm new password/i).fill('Newpass123');
    await dialog.getByRole('button', { name: /change password/i }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 15_000 });

    await page.evaluate(() => { window.localStorage.removeItem('ezyify.session'); window.localStorage.removeItem('ezyify.mock.refresh'); });
    await page.goto('/login');
    await page.getByLabel(/^email/i).fill('buyer@ezyify.test');
    await page.getByLabel(/^password/i).fill('Newpass123');
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
  });
});

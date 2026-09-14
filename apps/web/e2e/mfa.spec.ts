import { test, expect, signIn } from './fixtures';

/** Phase 8.7 — TOTP enrolment + login step-up against the mock API (any 6 digits except 000000 are accepted). */
test.describe('two-factor authentication', () => {
  test('enrol from security settings, then login requires the code', async ({ page }) => {
    await signIn(page);

    await page.goto('/settings/security');
    await expect(page.getByRole('heading', { name: /two-factor authentication/i })).toBeVisible();
    await page.getByRole('button', { name: /^set up$/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: /scan with your authenticator/i })).toBeVisible();
    await expect(dialog.getByRole('img', { name: /qr code/i })).toBeVisible({ timeout: 10_000 });

    // Wrong code first — the mock rejects 000000.
    await dialog.locator('input').first().fill('000000');
    await expect(dialog.getByRole('alert')).toBeVisible();
    await dialog.locator('input').first().fill('123456');
    await expect(dialog.getByRole('heading', { name: /save your recovery codes/i })).toBeVisible();
    const codes = await dialog.locator('li').allTextContents();
    expect(codes.length).toBeGreaterThanOrEqual(8);
    await dialog.getByRole('button', { name: /saved them/i }).click();
    await expect(page.getByText(/recovery codes left/i)).toBeVisible();

    // Sign out (server-side, mock state persists in this tab's sessionStorage) and back in: login now steps up.
    await page.evaluate(() => {
      // Drop the client session + mock refresh cookie only; the mock snapshot (with MFA on) stays in sessionStorage.
      window.localStorage.removeItem('ezyify.session');
      window.localStorage.removeItem('ezyify.mock.refresh');
    });
    await page.goto('/login');
    await page.getByLabel(/^email/i).fill('buyer@ezyify.test');
    await page.getByLabel(/^password/i).fill('Password1');
    await page.getByRole('button', { name: /^sign in$/i }).click();
    // Mock state is per-tab (sessionStorage snapshot) and MFA was enabled in this tab, so the challenge must appear.
    await expect(page).toHaveURL(/\/two-factor/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /two-factor check/i })).toBeVisible();

    await page.getByRole('button', { name: /recovery code/i }).click();
    await page.getByLabel(/recovery code/i).fill(codes[0]!.trim());
    await page.getByRole('button', { name: /use recovery code/i }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
  });

  test('/two-factor without a challenge falls back to login', async ({ page }) => {
    await page.goto('/two-factor');
    await expect(page).toHaveURL(/\/login/);
  });
});

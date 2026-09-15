import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
/** Drops the client session only; the per-tab mock snapshot (with the KYC rows) survives. */
const switchUser = async (page: Page, email: string) => {
  await page.evaluate(() => { window.localStorage.removeItem('ezyify.session'); window.localStorage.removeItem('ezyify.mock.refresh'); });
  await signIn(page, email);
};
const signIn = async (page: Page, email: string) => {
  await page.goto('/login');
  await page.getByLabel(/^email/i).fill(email);
  await page.getByLabel(/^password/i).fill('Password1');
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/(two-factor)?$/, { timeout: 15_000 });
};

test.describe('identity verification (KYC) on /kyc + /admin/kyc', () => {
  // Four sign-ins across two roles in one tab; give it headroom over the 30s default.
  test.setTimeout(60_000);
  test('seller submits with uploaded documents, admin rejects then approves, verified badge appears', async ({ page }) => {
    // workspace is the only unverified seller fixture.
    await signIn(page, 'workspace@ezyify.test');
    await page.goto('/seller/kyc-verification');
    await expect(page.getByRole('heading', { name: /identity verification/i })).toBeVisible({ timeout: 15_000 });

    // Client-side validation blocks minors and missing uploads before any request.
    await page.getByLabel(/legal full name/i).fill('Work Space');
    await page.getByLabel(/date of birth/i).fill('2015-01-01');
    await page.getByLabel(/country of issue/i).fill('de');
    await page.getByLabel(/document number/i).fill('DE-55443322');
    await page.getByRole('button', { name: /submit for review/i }).click();
    await expect(page.getByText(/at least 18/i)).toBeVisible();
    await expect(page.getByText(/upload the front/i)).toBeVisible();

    await page.getByLabel(/date of birth/i).fill('1988-06-15');
    await page.getByLabel(/document front file/i).setInputFiles({ name: 'front.png', mimeType: 'image/png', buffer: PNG });
    await page.getByLabel(/document back file/i).setInputFiles({ name: 'back.png', mimeType: 'image/png', buffer: PNG });
    await page.getByLabel(/^selfie file/i).setInputFiles({ name: 'selfie.png', mimeType: 'image/png', buffer: PNG });
    await expect(page.getByAltText(/selfie preview/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /submit for review/i })).toBeEnabled();
    await page.getByRole('button', { name: /submit for review/i }).click();
    await expect(page.getByTestId('kyc-status-pending')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('kyc-status-pending')).toContainText('ending in 3322');
    await expect(page.getByRole('button', { name: /submit for review/i })).toHaveCount(0);

    // Mock API state lives in this tab, so the admin reviews in the same tab after a session swap.
    await switchUser(page, 'admin@ezyify.test');
    await page.goto('/admin/operations/seller-approval');
    const card = page.locator('[data-testid^="kyc-kyc_u_workspace_"]').first();
    await expect(card).toBeVisible({ timeout: 15_000 });
    await expect(card).toContainText('workspace@ezyify.test');
    await expect(card).toContainText('····3322');
    await expect(card).not.toContainText('DE-55443322');
    await card.getByRole('button', { name: /^reject$/i }).click();
    await page.getByLabel(/^reason/i).fill('Selfie is blurry');
    await page.getByRole('button', { name: /reject & notify/i }).click();
    await expect(page.locator('[data-testid^="kyc-kyc_u_workspace_"]')).toHaveCount(0, { timeout: 15_000 });

    // Seller sees the reason and can resubmit with prefilled details.
    await switchUser(page, 'workspace@ezyify.test');
    await page.goto('/seller/kyc-verification');
    await expect(page.getByTestId('kyc-status-rejected')).toContainText('Selfie is blurry', { timeout: 15_000 });
    await expect(page.getByLabel(/legal full name/i)).toHaveValue('Work Space');
    await page.getByLabel(/document number/i).fill('DE-55443322');
    await page.getByLabel(/document front file/i).setInputFiles({ name: 'front.png', mimeType: 'image/png', buffer: PNG });
    await page.getByLabel(/document back file/i).setInputFiles({ name: 'back.png', mimeType: 'image/png', buffer: PNG });
    await page.getByLabel(/^selfie file/i).setInputFiles({ name: 'selfie.png', mimeType: 'image/png', buffer: PNG });
    await expect(page.getByAltText(/selfie preview/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /resubmit for review/i })).toBeEnabled();
    await page.getByRole('button', { name: /resubmit for review/i }).click();
    await expect(page.getByTestId('kyc-status-pending')).toBeVisible({ timeout: 15_000 });

    await switchUser(page, 'admin@ezyify.test');
    await page.goto('/admin/operations/seller-approval');
    const again = page.locator('[data-testid^="kyc-kyc_u_workspace_"]').first();
    await expect(again).toBeVisible({ timeout: 15_000 });
    await again.getByRole('button', { name: /^approve$/i }).click();
    await expect(page.locator('[data-testid^="kyc-kyc_u_workspace_"]')).toHaveCount(0, { timeout: 15_000 });
    await page.getByRole('tab', { name: /approved/i }).click();
    await expect(page.locator('[data-testid^="kyc-kyc_u_workspace_"]').first()).toContainText('Approved', { timeout: 15_000 });

    await switchUser(page, 'workspace@ezyify.test');
    await page.goto('/seller/kyc-verification');
    await expect(page.getByTestId('kyc-status-approved')).toBeVisible({ timeout: 15_000 });
    await page.goto('/seller/workspace');
    await expect(page.getByRole('img', { name: /^verified (user|seller)$/i }).first()).toBeVisible({ timeout: 15_000 });
  });

  test('non-admins cannot open the review queue', async ({ page }) => {
    await signIn(page, 'buyer@ezyify.test');
    await page.goto('/admin/operations/seller-approval');
    await expect(page.getByRole('heading', { name: /admins only/i })).toBeVisible({ timeout: 15_000 });
  });
});

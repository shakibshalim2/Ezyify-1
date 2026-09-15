import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

const signIn = async (page: Page, email: string) => {
  await page.goto('/login');
  await page.getByLabel(/^email/i).fill(email);
  await page.getByLabel(/^password/i).fill('Password1');
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/(two-factor)?$/, { timeout: 15_000 });
};

test.describe('seller hub · orders on GET /orders?role=seller', () => {
  test('seller sees only their orders, ships one with tracking and the detail timeline updates', async ({ page }) => {
    await signIn(page, 'techstore@ezyify.test');
    await page.goto('/seller/orders');
    await expect(page.getByRole('heading', { name: /^orders$/i })).toBeVisible({ timeout: 15_000 });

    const o2 = page.getByTestId('seller-order-o2');
    await expect(o2).toBeVisible({ timeout: 15_000 });
    await expect(o2).toContainText(/test buyer/i);
    await expect(o2).toContainText(/to ship/i);
    // fashion's order never shows up for techstore.
    await expect(page.getByTestId('seller-order-o1')).toHaveCount(0);

    await o2.getByRole('button', { name: /ship order/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /mark as shipped/i }).click();
    await expect(dialog.getByText(/enter the courier name/i)).toBeVisible();
    await dialog.getByLabel(/^courier/i).fill('JNE');
    await dialog.getByLabel(/tracking number/i).fill('JNE7788001');
    await dialog.getByRole('button', { name: /mark as shipped/i }).click();
    await expect(dialog).toBeHidden({ timeout: 10_000 });
    await expect(o2).toContainText(/shipped/i, { timeout: 10_000 });
    await expect(o2.getByRole('button', { name: /mark delivered/i })).toBeVisible();

    await o2.getByRole('link', { name: /details/i }).click();
    await expect(page).toHaveURL(/\/seller\/order-detail\/o2$/);
    await expect(page.getByRole('heading', { name: /EZ-10391/ })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('seller-order-tracking')).toHaveText('JNE7788001');
    await expect(page.getByText(/^shipped$/i).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /^buyer$/i })).toBeVisible();
    await expect(page.getByText(/jakarta/i).first()).toBeVisible();
  });

  test('buyer accounts are refused from the seller order hub', async ({ page }) => {
    await signIn(page, 'buyer@ezyify.test');
    await page.goto('/seller/orders');
    await expect(page.getByRole('heading', { name: /^orders$/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('seller-order-o2')).toHaveCount(0);
    await expect(page.getByText(/no orders yet/i)).toBeVisible({ timeout: 15_000 });
  });
});

import { test, expect } from './fixtures';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

test.describe('seller hub · store settings on PATCH /users/me', () => {
  test('loads the real store identity, saves changed fields and reflects them on the storefront', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/^email/i).fill('techstore@ezyify.test');
    await page.getByLabel(/^password/i).fill('Password1');
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/\/(two-factor)?$/, { timeout: 15_000 });

    await page.goto('/seller/settings');
    await expect(page.getByRole('heading', { name: /^store settings$/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByLabel(/store name/i)).toHaveValue('TechStore');
    await expect(page.getByLabel(/store handle/i)).toHaveValue('techstore');
    // The old placeholder fixture is gone.
    await expect(page.getByText(/seller@example\.com/i)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /all changes saved/i })).toBeDisabled();

    // Handle collisions come back as 409 mapped onto the field.
    await page.getByLabel(/store handle/i).fill('buyer');
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByLabel(/store handle/i)).toHaveAttribute('aria-invalid', 'true', { timeout: 15_000 });
    await page.getByLabel(/store handle/i).fill('techstore');

    await page.getByLabel(/store logo file/i).setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: PNG });
    const bio = `Official TechStore · ships worldwide ${Date.now().toString(36)}`;
    await page.getByLabel(/about your store/i).fill(bio);
    await page.getByLabel(/ships from/i).fill('Singapore');
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByRole('button', { name: /all changes saved/i })).toBeDisabled({ timeout: 15_000 });

    await page.goto('/seller/techstore');
    await page.getByRole('tab', { name: /about/i }).click();
    await expect(page.getByText(bio)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/singapore/i).first()).toBeVisible();
  });

  test('buyers are told a seller account is required', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/^email/i).fill('buyer@ezyify.test');
    await page.getByLabel(/^password/i).fill('Password1');
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
    await page.goto('/seller/settings');
    await expect(page.getByRole('heading', { name: /seller account required/i })).toBeVisible({ timeout: 15_000 });
  });
});

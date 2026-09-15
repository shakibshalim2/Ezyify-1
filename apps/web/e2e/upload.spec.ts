import { test, expect, signIn } from './fixtures';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

test.describe('create flow on POST /posts', () => {
  test('uploads a photo, tags a product, publishes and lands on the new post', async ({ page }) => {
    await signIn(page);
    await page.goto('/upload');
    await expect(page.getByRole('radio', { name: /^post/i })).toHaveAttribute('aria-checked', 'true', { timeout: 15_000 });
    await expect(page.getByRole('button', { name: /^next$/i })).toBeDisabled();

    // Unsupported types are rejected at intake, supported ones preview.
    await page.getByLabel(/choose media files/i).setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('nope') });
    await expect(page.getByText(/use jpg, png, webp/i)).toBeVisible();
    await page.getByLabel(/choose media files/i).setInputFiles({ name: 'shot.png', mimeType: 'image/png', buffer: PNG });
    await expect(page.getByAltText(/preview of shot\.png/i)).toBeVisible();
    await page.getByRole('button', { name: /^next$/i }).click();

    const caption = `Fresh desk setup ${Date.now().toString(36)} #desksetup`;
    await page.getByPlaceholder(/caption/i).first().fill(caption);
    await page.getByTestId('tag-product-prod-003').click();
    await expect(page.getByTestId('tag-product-prod-003')).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('button', { name: /^next$/i }).click();

    await expect(page.getByRole('heading', { name: /^review$/i })).toBeVisible();
    await expect(page.getByText(/aluminium laptop stand/i)).toBeVisible();
    await page.getByRole('button', { name: /publish post/i }).click();

    await expect(page).toHaveURL(/\/post\/post_/, { timeout: 20_000 });
    await expect(page.getByText(caption.replace(' #desksetup', ''))).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('link', { name: '#desksetup' })).toBeVisible();
  });

  test('story requires no caption and live hands off to the Live hub', async ({ page }) => {
    await signIn(page);
    await page.goto('/upload?kind=story');
    await expect(page.getByRole('radio', { name: /^story/i })).toHaveAttribute('aria-checked', 'true', { timeout: 15_000 });
    await page.getByLabel(/choose media files/i).setInputFiles({ name: 'day.png', mimeType: 'image/png', buffer: PNG });
    await page.getByRole('button', { name: /^next$/i }).click();
    // Stories skip product tagging and can publish without text.
    await expect(page.getByText(/tag products/i)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^next$/i })).toBeEnabled();
    await page.getByRole('button', { name: /^next$/i }).click();
    await page.getByRole('button', { name: /share story/i }).click();
    await expect(page).toHaveURL(/\/stories\/buyer$/, { timeout: 20_000 });

    await page.goto('/upload');
    await page.getByRole('radio', { name: /^live/i }).click();
    await expect(page.getByRole('link', { name: /open live shopping/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^next$/i })).toBeDisabled();
  });

  test('signed-out visitors are sent to login', async ({ page }) => {
    await page.goto('/upload');
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});

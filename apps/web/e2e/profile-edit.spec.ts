import { test, expect, signIn } from './fixtures';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

test.describe('profile · edit + connections on the real API', () => {
  test('edit profile loads /users/me, validates, uploads an avatar and PATCHes only changed fields', async ({ page }) => {
    await signIn(page);
    await page.goto('/profile/edit');
    await expect(page.getByRole('heading', { name: /^edit profile$/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByLabel(/display name/i)).toHaveValue('Test Buyer');
    await expect(page.getByLabel(/^username/i)).toHaveValue('buyer');
    // Old fixture copy is gone.
    await expect(page.getByText(/emma wilson/i)).toHaveCount(0);

    // Nothing changed → Save is disabled.
    await expect(page.getByRole('button', { name: /save changes/i })).toBeDisabled();

    // Taking a fixture user's handle is a 409 mapped onto the username field.
    await page.getByLabel(/^username/i).fill('techstore');
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByLabel(/^username/i)).toHaveAttribute('aria-invalid', 'true', { timeout: 15_000 });
    await expect(page.getByText(/username is taken/i).first()).toBeVisible();
    await page.getByLabel(/^username/i).fill('buyer');

    await page.getByLabel(/profile photo file/i).setInputFiles({ name: 'me.png', mimeType: 'image/png', buffer: PNG });
    await page.getByLabel(/^bio/i).fill('Weekend thrifter. Escrow-only buyer.');
    await page.getByLabel(/^location/i).fill('Jakarta');
    await page.getByLabel(/^website/i).fill('buyer.example.com');
    await page.getByRole('button', { name: /save changes/i }).click();

    await expect(page).toHaveURL(/\/profile\/buyer$/, { timeout: 15_000 });
    await expect(page.getByText(/weekend thrifter/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/jakarta/i).first()).toBeVisible();
  });

  test('connections list real followers/following and follow/unfollow round-trips', async ({ page }) => {
    await signIn(page);
    await page.goto('/profile/buyer/following');
    await expect(page.getByRole('heading', { name: /^connections$/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('tab', { name: /following/i })).toHaveAttribute('aria-selected', 'true');
    // Fixture: buyer follows maya, alex and sara.
    await expect(page.getByTestId('person-fashionista_maya')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('person-fashionista_maya').getByRole('button', { name: /following/i })).toBeVisible();

    // Unfollow → the viewer's following list refetches and the row leaves it (2 of 3 remain). Mock state is per tab, so no cleanup needed.
    await page.getByTestId('person-fashionista_maya').getByRole('button', { name: /following/i }).click();
    await expect(page.getByTestId('person-fashionista_maya')).toHaveCount(0, { timeout: 15_000 });
    await expect(page.locator('[data-testid^="person-"]')).toHaveCount(2);
    await expect(page.getByRole('tab', { name: /following · 2/i })).toBeVisible();

    await page.getByLabel(/search connections/i).fill('alex');
    await expect(page.locator('[data-testid^="person-"]')).toHaveCount(1);

    // A creator's followers list resolves the real profile name; the viewer can follow from there (sara follows nobody in the fixture, so the list is empty and shows an empty state).
    await page.goto('/profile/fashionista_maya/following');
    await expect(page.getByText(/maya chen · @fashionista_maya/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/not following anyone yet/i)).toBeVisible({ timeout: 15_000 });
    // Followers of a creator the viewer no longer follows: the viewer isn't listed.
    await page.getByRole('tab', { name: /followers/i }).click();
    await expect(page.getByTestId('person-buyer')).toHaveCount(0);
  });
});

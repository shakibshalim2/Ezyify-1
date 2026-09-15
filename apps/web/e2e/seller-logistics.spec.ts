import { test, expect } from './fixtures';

test.describe('seller hub · logistics on GET /orders?role=seller', () => {
  test('lanes reflect real order state, tracking links resolve, shipping moves a parcel between lanes', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/^email/i).fill('techstore@ezyify.test');
    await page.getByLabel(/^password/i).fill('Password1');
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/\/(two-factor)?$/, { timeout: 15_000 });

    await page.goto('/seller/logistics');
    await expect(page.getByRole('heading', { name: /^logistics$/i })).toBeVisible({ timeout: 15_000 });
    // Fixture: o2 (EZ-10391) is "processing" for techstore → sits in "To ship" with no tracking yet.
    const o2 = page.getByTestId('shipment-o2');
    await expect(o2).toBeVisible({ timeout: 15_000 });
    await expect(o2).toContainText('EZ-10391');
    await expect(o2).toContainText(/jakarta/i);
    await expect(o2).toContainText(/no tracking yet/i);
    // Old fixture rows are gone.
    await expect(page.getByText('TRK001')).toHaveCount(0);

    // Ship it from the logistics lane → it moves to "In transit" with a carrier tracking link.
    await o2.getByRole('button', { name: /ship order/i }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/^courier/i).fill('JNE');
    await dialog.getByLabel(/^tracking number/i).fill('JNE0099001');
    await dialog.getByRole('button', { name: /mark as shipped/i }).click();
    await expect(page.getByTestId('shipment-o2')).toHaveCount(0, { timeout: 15_000 });
    await page.getByRole('tab', { name: /in transit/i }).click();
    await expect(page.getByTestId('shipment-o2')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('shipment-o2').getByRole('link', { name: /^track/i })).toHaveAttribute('href', /jne\.co\.id.*JNE0099001/);

    // Search narrows by tracking number.
    await page.getByLabel(/search shipments/i).fill('JNE0099001');
    await expect(page.locator('[data-testid^="shipment-"]')).toHaveCount(1);
    await page.getByLabel(/search shipments/i).fill('nope-xyz');
    await expect(page.getByText(/no shipments match/i)).toBeVisible();
  });
});

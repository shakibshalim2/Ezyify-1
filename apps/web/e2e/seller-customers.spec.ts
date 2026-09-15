import { test, expect } from './fixtures';

test('seller hub · customers list is aggregated from orders with search and sort', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/^email/i).fill('techstore@ezyify.test');
  await page.getByLabel(/^password/i).fill('Password1');
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/(two-factor|welcome)?$/, { timeout: 15_000 });

  await page.goto('/seller/customers');
  await expect(page.getByRole('heading', { name: /^customers$/i })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('customers-summary')).toContainText(/repeat buyers/i, { timeout: 15_000 });
  const buyer = page.getByTestId('seller-customer-buyer');
  await expect(buyer).toBeVisible({ timeout: 15_000 });
  await expect(buyer).toContainText(/test buyer/i);
  await expect(buyer).toContainText(/1 open/i);
  await expect(buyer).toContainText('$79.99');
  // Old fixture rows are gone.
  await expect(page.getByText(/ahmed@email.com/i)).toHaveCount(0);

  await page.getByRole('button', { name: /top spenders/i }).click();
  await expect(page.getByRole('button', { name: /top spenders/i })).toHaveAttribute('aria-pressed', 'true');
  await page.getByLabel(/search customers/i).fill('test buyer');
  await expect(page.getByRole("region", { name: /customer list/i }).getByRole("listitem")).toHaveCount(1);
});

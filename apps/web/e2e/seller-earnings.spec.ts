import { test, expect } from './fixtures';

test('seller hub · earnings, payout methods and withdrawal flow run on the API', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/^email/i).fill('techstore@ezyify.test');
  await page.getByLabel(/^password/i).fill('Password1');
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/(two-factor|welcome)?$/, { timeout: 15_000 });

  await page.goto('/seller/earnings');
  await expect(page.getByRole('heading', { name: /^earnings$/i })).toBeVisible({ timeout: 15_000 });
  const available = page.getByTestId('earnings-available');
  await expect(available).toContainText(/\$[\d,]+\.\d{2}/, { timeout: 15_000 });
  const startText = (await available.textContent())!;
  await expect(page.getByText(/pays out to bank mandiri ••••5544/i)).toBeVisible();
  await expect(page.getByTestId('earnings-this-month')).toContainText(/released month to date/i);
  await expect(page.getByRole('img', { name: /daily escrow releases/i })).toBeVisible();
  // Fixture placeholders are gone.
  await expect(page.getByText('$3,240')).toHaveCount(0);

  // Add an e-wallet payout method.
  await page.getByRole('link', { name: /payout methods/i }).click();
  await expect(page).toHaveURL(/\/seller\/payout-settings$/);
  await expect(page.getByTestId('payout-method-pm_techstore_1')).toContainText(/default/i, { timeout: 15_000 });
  await page.getByRole('button', { name: /^add$/i }).click();
  await page.getByRole('radio', { name: /e‑wallet/i }).click();
  await page.getByRole('button', { name: /save payout method/i }).click();
  await expect(page.getByText(/enter a valid account number/i)).toBeVisible();
  await page.getByLabel(/e‑wallet provider/i).fill('GoPay');
  await page.getByLabel(/account holder name/i).fill('TechStore Pte Ltd');
  await page.getByLabel(/phone \/ account id/i).fill('081234567890');
  await page.getByRole('button', { name: /save payout method/i }).click();
  await expect(page.getByRole('list', { name: /saved payout methods/i })).toContainText(/gopay ••••7890/i, { timeout: 10_000 });
  await expect(page.getByRole('list', { name: /saved payout methods/i })).not.toContainText('081234567890');

  // Withdraw to the default method.
  await page.goto('/seller/withdraw');
  await expect(page.getByTestId('withdraw-available')).toHaveText(startText, { timeout: 15_000 });
  await page.getByLabel(/withdrawal amount/i).fill('1');
  await expect(page.getByText(/minimum withdrawal is \$5\.00/i)).toBeVisible();
  await page.getByLabel(/withdrawal amount/i).fill('25.50');
  await expect(page.getByTestId('withdraw-summary')).toContainText('$25.50');
  await page.getByRole('button', { name: /withdraw \$25\.50/i }).click();
  await expect(page.getByTestId('withdraw-success')).toContainText(/\$25\.50 on its way/i, { timeout: 10_000 });
  await page.getByRole('button', { name: /back to earnings/i }).click();
  await expect(page.getByTestId('earnings-available')).not.toHaveText(startText, { timeout: 15_000 });
  await expect(page.getByText(/\$25\.50 on its way to your bank/i)).toBeVisible();
  await expect(page.getByTestId('earnings-payouts')).toContainText(/withdrawal · bank mandiri ••••5544/i);
});

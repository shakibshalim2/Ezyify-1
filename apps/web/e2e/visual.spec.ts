import { test, expect } from './fixtures';

/**
 * Visual regression of key screens. Baselines live in e2e/__screenshots__ and are updated deliberately with
 * `pnpm e2e -- --update-snapshots`; animation is frozen so runs are deterministic.
 */
const screens = ['/', '/shop', '/login', '/cart', '/wallet', '/orders'] as const;

for (const path of screens) {
  test(`visual: ${path}`, async ({ page }, testInfo) => {
    await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }' }).catch(() => undefined);
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });
    await expect(page).toHaveScreenshot(`${path === '/' ? 'home' : path.slice(1)}-${testInfo.project.name}.png`, {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
      mask: [page.locator('img'), page.locator('video'), page.locator('time')],
    });
  });
}

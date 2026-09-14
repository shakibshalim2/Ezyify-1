import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: './e2e',
  // Visual baselines are rendering-environment specific; they run as their own (non-blocking) CI step.
  testIgnore: process.env.PW_VISUAL ? undefined : ['**/visual.spec.ts'],
  grep: process.env.PW_VISUAL ? /visual:/ : undefined,
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  expect: { toHaveScreenshot: { animations: 'disabled', scale: 'css' } },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    // Journeys run against the in-process mock API unless E2E_API_URL points at a real backend.
    command: process.env.E2E_API_URL ? `VITE_API_BASE_URL=${process.env.E2E_API_URL} pnpm build && pnpm preview --port ${PORT} --strictPort` : `VITE_API_MODE=mock pnpm build && pnpm preview --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});

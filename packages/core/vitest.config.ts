import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.*', 'src/**/index.ts', 'src/mock/fixtures.ts'],
      thresholds: { lines: 70, statements: 70, functions: 60, branches: 70 },
    },
  },
});

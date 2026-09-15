import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

/** SWC handles legacy decorators + emitDecoratorMetadata, which esbuild (vitest default) cannot emit for Nest DI. */
export default defineConfig({
  plugins: [swc.vite({ jsc: { parser: { syntax: 'typescript', decorators: true }, transform: { decoratorMetadata: true, legacyDecorator: true }, target: 'es2022' } })],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
    globalSetup: ['test/setup.ts'],
    env: { NODE_ENV: 'test' },
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // Module classes are pure DI wiring (decorators only) and are exercised by app boot, not by line coverage.
      exclude: ['src/generated/**', 'src/main.ts', 'src/openapi.ts', 'src/scripts/**', 'src/**/*.module.ts', 'src/**/*.spec.ts'],
      thresholds: { lines: 70, statements: 70, functions: 70, branches: 55 },
    },
  },
});

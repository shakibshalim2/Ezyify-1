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
    coverage: { provider: 'v8', include: ['src/**/*.ts'], exclude: ['src/generated/**', 'src/main.ts', 'src/openapi.ts'], thresholds: { lines: 60 } },
  },
});

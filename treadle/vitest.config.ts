import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  // Package exports target dist in production; tests must exercise the source
  // modules included by coverage, rather than a second compiled copy.
  resolve: {
    alias: {
      '@treadle/core': fileURLToPath(new URL('./packages/core/src/index.ts', import.meta.url)),
      '@treadle/knowledge': fileURLToPath(
        new URL('./packages/knowledge/src/index.ts', import.meta.url),
      ),
      '@treadle/web': fileURLToPath(new URL('./packages/web/src/index.ts', import.meta.url)),
      '@treadle/brand': fileURLToPath(new URL('./packages/brand/src/index.ts', import.meta.url)),
    },
  },
  test: {
    ...(process.env.CI
      ? { reporters: ['default', 'json'], outputFile: { json: 'test-results.json' } }
      : {}),
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['packages/*/src/**/*.ts'],
      exclude: ['packages/*/src/**/*.d.ts', 'packages/web/src/*.js'],
      thresholds: {
        // beta posture: the floor rises only with deliberate commits
        lines: 75,
        functions: 75,
        statements: 75,
        branches: 65,
      },
    },
  },
});

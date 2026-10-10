import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
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

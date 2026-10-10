import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      'packages/*/test/**',
      'packages/web/src/*.js', // vendored browser assets, not node source
      'packages/cli/harness/**', // shipped payload (plain JS by contract), not workspace source
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['scripts/*.mjs', 'bin/*.mjs'], // first-party scripts LINT (R2 #18)
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly', URL: 'readonly', import: 'readonly' },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-unused-private-class-members': 'error',
      eqeqeq: ['error', 'always'],
      'no-throw-literal': 'error',
    },
  },
);

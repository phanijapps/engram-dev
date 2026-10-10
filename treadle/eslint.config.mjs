import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/*.mjs',
      'packages/*/test/**',
      'packages/web/src/*.js',
      'harness/**',
    ],
  }, // vendored browser assets + shipped harness payload (plain JS by contract), not workspace source
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-unused-private-class-members': 'error',
      eqeqeq: ['error', 'always'],
      'no-throw-literal': 'error',
    },
  },
);

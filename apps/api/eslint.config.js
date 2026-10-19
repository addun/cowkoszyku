import tsParser from '@typescript-eslint/parser';
import noFeatureDeps from './eslint/no-feature-deps.js';

export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    plugins: {
      cowkoszyku: {
        rules: {
          'no-feature-deps': noFeatureDeps,
        },
      },
    },
    rules: {
      'cowkoszyku/no-feature-deps': 'error',
    },
  },
];

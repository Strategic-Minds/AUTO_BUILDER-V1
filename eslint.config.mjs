import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'test-results/**',
      'src/workers/adapters/**',
      '**/*.mjs',
      'scripts/**',
      'next-env.d.ts',       // Next.js-generated, always uses triple-slash refs - not our code
      'public/**',            // service worker runs in browser/SW global scope, not our lint target
      'playwright.config.ts', // intentionally uses ts-nocheck for a documented reason
    ],
  },
  {
    languageOptions: {
      globals: { module: 'writable', require: 'readonly', process: 'readonly', __dirname: 'readonly' },
    },
    files: ['next.config.js', '*.config.js'],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
]

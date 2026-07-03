import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['node_modules/**', '.next/**', 'test-results/**', 'src/workers/adapters/**', '**/*.mjs', 'scripts/**', 'next-env.d.ts'],
  },
  {
    files: ['next.config.js'],
    languageOptions: {
      globals: {
        module: 'readonly',
        process: 'readonly',
      },
    },
  },
  {
    files: ['public/sw.js'],
    languageOptions: {
      globals: {
        caches: 'readonly',
        clients: 'readonly',
        fetch: 'readonly',
        self: 'readonly',
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
]

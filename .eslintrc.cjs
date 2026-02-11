module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'script',
  },
  extends: ['eslint:recommended'],
  globals: {
    navigateTo: 'readonly',
  },
  rules: {
    'no-undef': 'error',
    'no-redeclare': 'error',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    eqeqeq: 'warn',
    'no-empty': 'warn',
    'no-useless-escape': 'warn',
  },
  overrides: [
    {
      files: ['vite.config.js'],
      env: { node: true },
      parserOptions: { sourceType: 'module' },
    },
  ],
};

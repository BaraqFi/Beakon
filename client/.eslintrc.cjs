module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  plugins: ['react'],
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^React$' }],
    'react/jsx-uses-vars': 'error',
    'react/react-in-jsx-scope': 'off'
  }
};

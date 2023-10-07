module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'indent': ['error', 2],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    '@typescript-eslint/no-var-requires': ['off'],
    '@typescript-eslint/ban-ts-comment': ['off']
  },
  parserOptions: {
    'ecmaVersion': 6,
    'sourceType': 'module',
    'ecmaFeatures': {
      'jsx': true
    }
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  /**
   * 设置对应环境的全局变量
   */
  env: {
    'es6': true,
    'browser': true,
    'node': true
  }
};

module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  rules: {
    'indent': ['error', 2],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single']
    // "quotes": ["error"],
    // 'eqeqeq': ['error', 'smart']
  },
  'parserOptions': {
    'ecmaVersion': 6,
    'sourceType': 'module',
    'ecmaFeatures': {
      'jsx': true
    }
  },
  /**
   * 设置对应环境的全局变量
   */
  env: {
    'es6': true,
    'browser': true,
    'node': true
  }
};

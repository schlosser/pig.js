module.exports = {
  env: {
    es6: true,
    browser: true
  },
  plugins: [
    'jsdoc',
    'security',
    'security-node'
  ],
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'plugin:jsdoc/recommended',
    'plugin:security/recommended',
    'plugin:security-node/recommended'
  ],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 9
  },
  rules: {
    'class-methods-use-this': 'off',
    'comma-dangle': 'off',
    'jsdoc/tag-lines': [
      'warn',
      'never',
      {
        tags:
        {
          param:
          {
            lines: 'any'
          }
        }
      }
    ],
    'linebreak-style': [
      'error',
      process.platform === 'win32' ? 'windows' : 'unix'
    ],
    'max-classes-per-file': 'off',
    'no-console': [
      'error',
      {
        allow: [
          'log',
          'warn',
          'error',
          'dir'
        ]
      }
    ],
    'no-else-return': 'off',
    'no-multi-spaces': [
      'error',
      {
        ignoreEOLComments: true
      }
    ],
    'no-underscore-dangle': [
      'error',
      {
        allowAfterThis: true
      }
    ],
    'operator-linebreak': [
      'error',
      'after'
    ],
    'security/detect-object-injection': 'off',
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'never',
        asyncArrow: 'always',
        named: 'never'
      }
    ]
  }
};

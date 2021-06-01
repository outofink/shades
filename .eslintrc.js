module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'extends': [
    'google',
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 12,
    'sourceType': 'module',
  },
  'plugins': [
    '@typescript-eslint',
  ],
  'rules': {
    'max-len': ['error', {'code': 100}],
    'require-jsdoc': ['error', {
      'require': {
        'FunctionDeclaration': false,
        'MethodDefinition': false,
        // 'ClassDeclaration': false,
        // 'ArrowFunctionExpression': false,
        // 'FunctionExpression': false,
      },
    }],
  },
};

module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    "no-proto": 0,
    "no-unused-expressions": 0,
    "no-restricted-syntax": 0,
    "no-underscore-dangle": 0,
    "class-methods-use-this": 0,
    "no-await-in-loop": 0,
    "array-callback-return": 0,
    "consistent-return": 0,
    "max-classes-per-file":[1, 1],
  },
};

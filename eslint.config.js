module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2020, // 推荐使用最新的 ECMAScript 版本
  },
  ignorePatterns: ['node_modules/*', '.next/*', 'out/*', 'dist/*'],
  extends: [
    'eslint:recommended',
    'next/core-web-vitals'
  ],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      settings: { react: { version: 'detect' } },
      env: {
        browser: true,
        node: true,
        es6: true,
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
      ],
      rules: {
        // 你可以在这里添加自定义规则
      },
    },
  ],
  // 移除不再支持的选项
}

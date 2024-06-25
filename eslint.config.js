
// module.exports = {
//   root: true,
//   env: {
//     node: true,
//     es6: true,
//   },
//   parserOptions: {
//     ecmaVersion: 8,
//   },
//   ignorePatterns: ['node_modules/*', '.next/*', 'out/*', 'dist/*'],
//   extends: [
//     'eslint:recommended',
//     // Add other extends or plugins here
//   ],
//   overrides: [
//     {
//       files: ['**/*.ts', '**/*.tsx'],
//       parser: '@typescript-eslint/parser',
//       settings: { react: { version: 'detect' } },
//       env: {
//         browser: true,
//         node: true,
//         es6: true,
//       },
//       extends: [
//         'eslint:recommended',
//         'plugin:@typescript-eslint/recommended', // TypeScript rules
//         'plugin:react/recommended', // React rules
//         'plugin:react-hooks/recommended', // React hooks rules
//         'plugin:jsx-a11y/recommended', // Accessibility rules
//         'next/core-web-vitals'
//       ],
//       rules: {
//         // You can add custom rules here
//       },
//     },
//   ],
// }
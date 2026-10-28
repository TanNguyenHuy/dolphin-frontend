import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
    { ignores: ['dist/**', 'node_modules/**'] },
    {
        files: ['src/**/*.{js,jsx}'],
        languageOptions: { globals: globals.browser, parserOptions: { ecmaFeatures: { jsx: true } } },
        plugins: { 'react-hooks': reactHooks },
        rules: { 'no-undef': 'error', 'no-dupe-keys': 'error', 'no-unreachable': 'error', 'react-hooks/rules-of-hooks': 'error' },
    },
];

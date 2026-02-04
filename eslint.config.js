import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
    {
        ignores: ['dist/', 'node_modules/', '.opencode/', '**/*.log'],
    },
    js.configs.recommended,
    prettier,
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                console: 'readonly',
                globalThis: 'readonly',
                THREE: 'readonly',
                window: 'readonly',
                document: 'readonly',
                setTimeout: 'readonly',
                requestAnimationFrame: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'off',
            'prefer-const': 'warn',
            eqeqeq: 'warn',
        },
    },
];

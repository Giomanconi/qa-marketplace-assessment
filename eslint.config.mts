import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-plugin-prettier';

type WithRules = { rules?: Record<string, unknown> };

const recommendedFor = (preset: unknown): Record<string, unknown> =>
    (preset as WithRules | undefined)?.rules ?? {};

export default [
    { ignores: ['node_modules', 'dist', 'playwright-report', 'test-results'] },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: ['./tsconfig.json'],
                tsconfigRootDir: __dirname,
            },
        },
        plugins: { '@typescript-eslint': tsPlugin, playwright, prettier },
        rules: {
            ...recommendedFor(tsPlugin.configs?.recommended),
            ...recommendedFor(playwright.configs?.['flat/recommended']),

            'no-console': 'error',
            'prefer-const': 'error',
            'prettier/prettier': 'error',

            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/no-empty-function': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-inferrable-types': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],

            // Known defects stay visible as failing tests or marked skips.
            'playwright/no-skipped-test': 'off',

            'playwright/expect-expect': 'error',
            'playwright/missing-playwright-await': 'error',
            'playwright/no-eval': 'error',
            'playwright/no-focused-test': 'error',
            'playwright/no-page-pause': 'error',
            'playwright/no-standalone-expect': 'error',
            'playwright/no-useless-await': 'error',
            'playwright/no-useless-not': 'error',
            'playwright/no-wait-for-timeout': 'error',
            'playwright/prefer-to-be': 'error',
            'playwright/prefer-to-have-length': 'error',
            'playwright/prefer-web-first-assertions': 'error',
            'playwright/require-top-level-describe': 'error',
            'playwright/valid-expect': 'error',

            'playwright/no-conditional-in-test': 'warn',
            'playwright/no-force-option': 'warn',
            'playwright/no-nth-methods': 'warn',
            'playwright/no-raw-locators': 'warn',
            'playwright/prefer-lowercase-title': [
                'warn',
                { ignore: ['test.describe'] },
            ],
        },
    },
];

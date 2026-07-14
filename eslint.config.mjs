import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
    { ignores: ['dist/', '.astro/', 'node_modules/', 'generated/', 'public/', 'docs/'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...astro.configs.recommended,
    {
    // build scripts and islands run under node and the browser respectively
        languageOptions: { globals: { ...globals.node, ...globals.browser } },
    },
    {
        files: ['**/*.tsx'],
        plugins: { 'react-hooks': reactHooks },
        // just the two established rules; the newer compiler-era checks flag
        // deliberate island patterns (SSR mount guard, ref-measured chart)
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
    },
    {
        plugins: { '@stylistic': stylistic },
        rules: {
            // the data layer casts GraphQL JSON at its boundaries; a blanket ban
            // would force churn without adding safety there
            '@typescript-eslint/no-explicit-any': 'off',
            '@stylistic/indent': ['error', 4],
        },
    },
);

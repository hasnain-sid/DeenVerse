module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        'prettier', // must be last — disables eslint rules that conflict with prettier
    ],
    ignorePatterns: ['dist', 'node_modules', '*.cjs'],
    parser: '@typescript-eslint/parser',
    plugins: [],
    rules: {
        // TypeScript — relax 'any' to a warning (justified uses are documented in the codebase)
        '@typescript-eslint/no-explicit-any': 'warn',

        // Allow unused vars only when prefixed with _ (common in destructuring)
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

        // Disallow console.log in production code — use the logger util
        'no-console': ['warn', { allow: ['warn', 'error'] }],

        // Prefer const
        'prefer-const': 'error',

        // No var
        'no-var': 'error',

        // react-hooks/exhaustive-deps: warn rather than error (many legitimate existing patterns)
        'react-hooks/exhaustive-deps': 'warn',

        // Disable experimental React Compiler rules — not production-ready yet
        'react-hooks/set-state-in-effect': 'off',
        'react-hooks/preserve-manual-memoization': 'off',
    },
};

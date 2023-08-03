/** @type {import("eslint").Linter.Config} */
const config = {
	extends: [
		'turbo',
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended-type-checked',
		'plugin:@typescript-eslint/stylistic-type-checked',
		'prettier'
	],
	env: {
		es2022: true,
		node: true
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: true
	},
	plugins: ['@typescript-eslint', 'import'],
	rules: {
		'@typescript-eslint/no-unused-vars': [
			'error',
			{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
		],
		'@typescript-eslint/consistent-type-imports': [
			'warn',
			{ prefer: 'type-imports', fixStyle: 'separate-type-imports' }
		],
		'@typescript-eslint/no-misused-promises': [
			2,
			{ checksVoidReturn: { attributes: false } }
		],
		'@typescript-eslint/no-unsafe-member-access': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-unsafe-assignment': 'off',
		'@typescript-eslint/dot-notation': 'off',
		'@typescript-eslint/no-misused-promises': 'off',
		'@typescript-eslint/ban-ts-comment': 'off'
	},
	ignorePatterns: [
		'**/.eslintrc.cjs',
		'**/*.config.js',
		'**/*.config.cjs',
		'packages/config/**',
		'.next',
		'dist',
		'pnpm-lock.yaml'
	],
	reportUnusedDisableDirectives: true
};

module.exports = config;

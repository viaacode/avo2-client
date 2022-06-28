module.exports = {
	parser: '@typescript-eslint/parser',
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:import/recommended',
		'plugin:import/typescript',
		'plugin:prettier/recommended',
	],
	settings: {
		react: {
			version: '16.13',
		},
	},
	rules: {
		'@typescript-eslint/naming-convention': [
			'error',
			{
				selector: 'interface',
				format: ['PascalCase'],
				custom: {
					regex: '^I[A-Z]',
					match: false,
				},
			},
		],

		'import/first': 'error',
		'import/no-duplicates': 'error',
		'import/order': [
			'warn',
			{
				alphabetize: {
					order: 'asc',
				},
				'newlines-between': 'always',
			},
		],

		'react/self-closing-comp': 'warn',

		'sort-imports': [
			'warn',
			{
				ignoreCase: true,
				ignoreDeclarationSort: true,
			},
		],
	},
};

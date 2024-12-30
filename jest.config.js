module.exports = {
	preset: 'ts-jest',
	setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts', 'jest-expect-message'],
	testMatch: [
		'<rootDir>/src/**/*.test.tsx',
		'<rootDir>/src/**/*.test.ts',
		'<rootDir>/src/**/*.spec.tsx',
		'<rootDir>/src/**/*.spec.ts',
	],
	moduleNameMapper: {
		'^lodash-es$': '<rootDir>/node_modules/lodash/index.js',
	},
	moduleDirectories: ['node_modules'],
	transform: {
		'^.+\\.svg$': '<rootDir>/svgTransform.js',
		'^.+\\.(ts|tsx)$': 'ts-jest',
	},
	maxConcurrency: 1,
};

module.exports = {
	preset: 'ts-jest',
	setupFilesAfterEnv: [
		'<rootDir>/src/setupTests.ts',
		'jest-expect-message'
	],
	moduleNameMapper: {
		'^lodash-es$': '<rootDir>/node_modules/lodash/index.js'
	},
	moduleDirectories: ['node_modules'],
};

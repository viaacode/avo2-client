module.exports = {
	preset: 'ts-jest',
	setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
	moduleNameMapper: {
		'^lodash-es$': '<rootDir>/node_modules/lodash/index.js'
	},
};

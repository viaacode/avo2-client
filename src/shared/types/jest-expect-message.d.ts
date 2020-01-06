/// <reference types="jest"/>

declare namespace jest {
	interface Expect {
		<T = any>(actual: T, message: string): jest.Matchers<T>;
	}
}

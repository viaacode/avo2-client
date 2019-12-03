/// <reference types="cypress" />

declare namespace Cypress {
	interface Chainable {
		/**
		 * Login to the idp
		 * @example cy.login('user@test.be', 'mypass')
		 */
		login(email: string, password: string): void;

		/**
		 * Login to the idp with manual redirect to login page and after logn redirect to redirectPath
		 * @example cy.login('user@test.be', 'mypass')
		 */
		manualLogin(redirectPath: string, email: string, password: string): void;

		/**
		 * Logout of the idp
		 * @example cy.logout()
		 */
		logout(): void;

		waitUntil<Subject>(
			checkFunction: () => Subject | Chainable | Promise<Subject>,
			options?: { timeout?: number; interval?: number; errorMsg?: string }
		): Chainable;
	}
}

declare namespace Cypress {
	interface Chainable {
		/**
		 * Login to the idp
		 * @example cy.login('user@test.be', 'mypass')
		 */
		login(email: string, password: string): void;

		/**
		 * Logout of the idp
		 * @example cy.logout()
		 */
		logout(): void;
	}
}

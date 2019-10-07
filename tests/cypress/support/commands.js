// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import 'cypress-wait-until';

Cypress.Commands.add("login", (email, password) => {
	cy.location('pathname').should('equal', '/module.php/core/loginuserpass.php');
	cy.get('#emailId').type(email, { timeout: 3000 });
	cy.get('#passwordId').type(password, { log: false });
	cy.get('#wp-submit').click();
	cy.location('host').should('equal', Cypress.env('CLIENT_BASE_URL').split('/').pop());
});

Cypress.Commands.add("manualLogin", (redirectPath, email, password) => {
	cy.visit(`${Cypress.env('CLIENT_BASE_URL')}/aanmelden`);
	cy.login(email, password);
	cy.visit(`${Cypress.env('CLIENT_BASE_URL')}/${redirectPath}`);
});

Cypress.Commands.add("logout", () => {
	return cy.visit(`${Cypress.env('CLIENT_BASE_URL')}/afmelden`);
});

/// <reference path="../support/index.d.ts" />

context('Search', () => {
	beforeEach(() => {
		cy.viewport(1920, 937);
		cy.visit(`${Cypress.env('CLIENT_BASE_URL')}/zoeken`);
		cy.login(Cypress.env('SHD_TEST_ACCOUNT_EMAIL'), Cypress.env('SHD_TEST_ACCOUNT_PASSWORD'));
	});

	it('Initial search results should load', () => {
		cy.get('.c-search-result').should('have.length', 10);
		const numberOfResultsParagraph = cy.get(
			'.o-container > .c-toolbar > .c-toolbar__left > .c-toolbar__item > .c-body-1'
		);
		numberOfResultsParagraph.should('contain', '1-10 van ');
		numberOfResultsParagraph.should('contain', ' resultaten');

		cy.get('.c-pagination__pages').within(() => {
			cy.get('.c-pagination__btn')
				.first()
				.should('have.class', 'c-pagination__btn--active');
			cy.get('.c-pagination__btn')
				.last()
				.should('not.have.class', 'c-pagination__btn--active');
		});
	});

	afterEach(() => {
		cy.logout();
	});
});

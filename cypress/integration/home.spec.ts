/// <reference path="../support/index.d.ts" />

context('Home', () => {
	beforeEach(() => {
		cy.viewport(1920, 937);
		cy.visit(Cypress.env('CLIENT_BASE_URL'));
	});

	it('Homepage should load correctly', () => {
		cy.contains('Vind alles wat je nodig hebt om je lessen te verrijken.');
	});

	it('Homepage should have working search field', () => {
		const searchField = cy.get('[placeholder="Vul een zoekterm in"]');
		searchField.click();

		// Check if menu becomes visible
		const searchResultMenu = cy.get('.c-menu--search-result');
		searchResultMenu.should('be.visible');

		// Check menu items
		searchResultMenu
			.find('.c-menu__item')
			.should('have.length', 5)
			.should('be.visible');
	});

	it('Search field menu should have working all search results button', () => {
		const searchField = cy.get('[placeholder="Vul een zoekterm in"]');
		searchField.click();

		const searchResultMenu = cy.get('.c-menu--search-result');
		const allSearchResultsButton = searchResultMenu.find('.c-menu__footer .c-button');
		allSearchResultsButton.click();

		cy.login(Cypress.env('SHD_TEST_ACCOUNT_EMAIL'), Cypress.env('SHD_TEST_ACCOUNT_PASSWORD'));

		cy.location('pathname').should('equal', '/zoeken');
	});

	it('Search field menu should link to results', () => {
		const searchField = cy.get('[placeholder="Vul een zoekterm in"]');
		searchField.click();

		const searchResultMenu = cy.get('.c-menu--search-result');
		searchResultMenu
			.find('.c-menu__item')
			.first()
			.click();

		cy.login(Cypress.env('SHD_TEST_ACCOUNT_EMAIL'), Cypress.env('SHD_TEST_ACCOUNT_PASSWORD'));

		// double encoded version of one of the content urls:
		// * /zoeken/item
		// * /zoeken/collectie
		// * /zoeken/bundle
		cy.location('pathname').then(pathname => {
			expect(pathname).to.match(/\/(item|collectie|bundel)\/.*/g);
		});
	});

	afterEach(() => {
		cy.logout();
	});
});

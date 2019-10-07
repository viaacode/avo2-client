/// <reference path="../support/index.d.ts" />

context('Home', () => {
	beforeEach(() => {
		cy.viewport(1920, 937);
		cy.visit(Cypress.env('CLIENT_BASE_URL'));
		cy.manualLogin(
			'',
			Cypress.env('SHD_TEST_ACCOUNT_EMAIL'),
			Cypress.env('SHD_TEST_ACCOUNT_PASSWORD')
		);
	});

	it('Homepage should load correctly', () => {
		cy.contains('Vind alles wat je nodig hebt om je lessen te verrijken.');
	});

	it('Homepage should have a working search field when logged in', () => {
		const searchField = cy.get('[placeholder="Vul een zoekterm in"]');
		searchField.click();

		// Check if menu becomes visible
		const searchResultMenu = cy.get('.c-menu--search-result');
		searchResultMenu.should('be.visible');

		// Check menu items
		searchResultMenu
			.find('.c-menu__item')
			.should('have.length', 5) // Not allowed search when logged out
			.should('be.visible');
	});

	it('Search field menu should have working all search results button', () => {
		const searchField = cy.get('[placeholder="Vul een zoekterm in"]');
		searchField.click();

		const searchResultMenu = cy.get('.c-menu--search-result');
		const allSearchResultsButton = searchResultMenu.find('.c-menu__footer .c-button');
		allSearchResultsButton.click();

		cy.location('pathname').should('equal', '/zoeken');
	});

	it('Search field menu should link to results', () => {
		const searchField = cy.get('[placeholder="Vul een zoekterm in"]');
		searchField.click();

		cy.waitUntil(() =>
			cy
				.get('.c-menu--search-result')
				.find('.c-menu__item')
				.its('length')
				.then(length => length >= 5)
		);

		cy.get('.c-menu--search-result')
			.find('.c-menu__item')
			.first()
			.click();

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

context('Home', () => {
	beforeEach(() => {
		cy.viewport(1920, 937);
		cy.visit('http://localhost:8080/');
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

		// Worki
	});
});

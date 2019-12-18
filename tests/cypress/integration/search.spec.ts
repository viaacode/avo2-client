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

	it('Search results should load with filters enabled', () => {
		const searchQuery = 'Nieuws';
		const provider = 'TV Oost';
		const fromDate = '1/01/2001';
		const toDate = '31/12/2016';

		// Wait for search results
		cy.get('.c-search-result', { timeout: 15000 });

		// Set search term to telefacts
		cy.get('.c-search-term-input-field').type(searchQuery);
		cy.get('.c-search-button').click();

		// Wait for search results
		cy.get('.c-search-result', { timeout: 15000 });

		// Set video filter
		cy.get('.c-filter-dropdown-type .c-checkbox-dropdown-modal__trigger').click();
		cy.get(
			'.c-menu--visible .o-form-group__controls > .c-checkbox-group > .c-checkbox > label > #video'
		).check('on');
		cy.get('.c-menu--visible .c-apply-filter-button').click();

		// Wait for search results
		cy.get('.c-search-result', { timeout: 15000 });

		// Set education level
		cy.get('.c-filter-dropdown-educationlevel .c-dropdown__trigger').click();
		cy.get(
			'.c-modal-context--visible input[id="Lager onderwijs"],' + // modal
				'.c-menu--visible input[id="Lager onderwijs"]' // dropdown
		).check('on');
		cy.get(
			'.c-modal-context--visible .c-apply-filter-button,' +
				'.c-menu--visible .c-apply-filter-button'
		).click();

		// Wait for search results
		cy.get('.c-search-result', { timeout: 15000 });

		// Set the date filter
		cy.get('.c-filter-dropdown-broadcastdate .c-dropdown__trigger').click();
		cy.get(
			'.c-menu--visible .o-form-group__controls > .c-radio-group > .c-radio:nth-child(2) > label > input'
		).type('date');
		cy.get(
			'.c-menu--visible .o-grid-col-6:nth-child(1) > .o-form-group > .o-form-group__controls > .c-input-with-icon > .react-datepicker-wrapper > .react-datepicker__input-container > .c-input'
		).type(fromDate);
		cy.get(
			'.c-menu--visible .o-grid-col-6:nth-child(2) > .o-form-group > .o-form-group__controls > .c-input-with-icon > .react-datepicker-wrapper > .react-datepicker__input-container > .c-input'
		).type(toDate);
		cy.get('.c-menu--visible .c-apply-filter-button').click();

		// Wait for search results
		cy.get('.c-search-result', { timeout: 15000 });

		// Set the provider
		cy.get(
			'.c-filter-dropdown-provider .c-checkbox-dropdown__trigger,' +
				'.c-filter-dropdown-provider .c-checkbox-dropdown-modal__trigger'
		).click();
		cy.get(
			`.c-modal-context--visible input[id="${provider}"],` +
				`.c-menu--visible input[id="${provider}"]`
		).check('on');
		cy.get(
			'.c-modal-context--visible .c-apply-filter-button,' +
				'.c-menu--visible .c-apply-filter-button'
		).click();

		// Check number of results
		cy.get('.c-search-result', { timeout: 15000 }).should('have.length', 10);
		const numberOfResultsParagraph = cy.get(
			'.o-container > .c-toolbar > .c-toolbar__left > .c-toolbar__item > .c-body-1'
		);
		numberOfResultsParagraph.should('contain', '1-10 van ');
		numberOfResultsParagraph.should('contain', ' resultaten');

		// Check result content
		cy.get('.c-search-result', { timeout: 15000 }).each(($el: Cypress.Chainable<HTMLElement>) => {
			cy.wrap(Cypress.$($el))
				.find('.c-search-result__title a')
				.contains(searchQuery);
			cy.wrap(Cypress.$($el))
				.find('.c-body-2')
				.contains(provider);
			cy.wrap(Cypress.$($el))
				.find('.c-meta-data__item:first-child() p')
				.should($dateEl => {
					const dateString: string = $dateEl.text();
					const year: number = parseInt(dateString.split('/').pop() || '0', 10);
					const fromYear: number = parseInt(fromDate.split('/').pop() || '0', 10);
					const toYear: number = parseInt(toDate.split('/').pop() || '0', 10);
					expect(year).to.be.within(fromYear, toYear);
				});
		});
	});

	afterEach(() => {
		cy.logout();
	});
});

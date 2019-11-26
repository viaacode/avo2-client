/// <reference path="../support/index.d.ts" />
context('Search', () => {
	beforeEach(() => {
		cy.viewport(1920, 937);
		cy.visit(`${Cypress.env('CLIENT_BASE_URL')}/zoeken`);
		cy.login(Cypress.env('SHD_TEST_ACCOUNT_EMAIL'), Cypress.env('SHD_TEST_ACCOUNT_PASSWORD'));
	});

	// it('Initial search results should load', () => {
	// 	cy.get('.c-search-result').should('have.length', 10);
	// 	const numberOfResultsParagraph = cy.get(
	// 		'.o-container > .c-toolbar > .c-toolbar__left > .c-toolbar__item > .c-body-1'
	// 	);
	// 	numberOfResultsParagraph.should('contain', '1-10 van ');
	// 	numberOfResultsParagraph.should('contain', ' resultaten');
	//
	// 	cy.get('.c-pagination__pages').within(() => {
	// 		cy.get('.c-pagination__btn')
	// 			.first()
	// 			.should('have.class', 'c-pagination__btn--active');
	// 		cy.get('.c-pagination__btn')
	// 			.last()
	// 			.should('not.have.class', 'c-pagination__btn--active');
	// 	});
	// });

	it('Search results should load with filters enabled', () => {
		const searchQuery = 'Telefacts';
		const provider = 'Medialaan';
		const fromDate = '1/01/2001';
		const toDate = '31/12/2016';

		// Set search term to telefacts
		cy.get('.c-search-term-input-field').type(provider);

		// Set video filter
		cy.get('.c-filter-dropdown-type .c-checkbox-dropdown-modal__trigger').click();
		cy.get(
			'.o-form-group > .o-form-group__controls:nth-child(2) > .c-checkbox-group > .c-checkbox:nth-child(1) > label'
		).click();
		cy.get('.o-form-group__controls > .c-checkbox-group > .c-checkbox > label > #video').check(
			'on'
		);
		cy.get('.c-apply-filter-button').click();

		// Set education level
		cy.get('.c-filter-dropdown-educationlevel .c-checkbox-dropdown__trigger').click();
		cy.get(
			'.c-modal-context:nth-child(9) > .c-modal:nth-child(1) > .c-modal__body:nth-child(2) > .u-spacer:nth-child(1) > .o-form-group-layout:nth-child(1) > .o-grid:nth-child(1) > .o-grid-col-bp2-4:nth-child(1) > .o-form-group:nth-child(1) .c-checkbox:nth-child(1) > label:nth-child(1)'
		).click();
		cy.get(
			'.o-form-group__controls > .c-checkbox-group > .c-checkbox > label > #Secundair onderwijs'
		).check('on');
		cy.get('.c-apply-filter-button').click();

		// Set the date filter
		cy.get('.c-filter-dropdown-broadcastdate .c-checkbox-dropdown-modal__trigger').click();
		cy.get('.o-form-group__controls > .c-radio-group > .c-radio:nth-child(2) > label > input').type(
			'date'
		);
		cy.get(
			'.o-form-group__controls > .c-input-with-icon > .react-datepicker-wrapper > .react-datepicker__input-container > .react-datepicker-ignore-onclickoutside'
		).click();
		cy.get(
			'.o-grid-col-6:nth-child(1) > .o-form-group > .o-form-group__controls > .c-input-with-icon > .react-datepicker-wrapper > .react-datepicker__input-container > .c-input'
		).type(fromDate);
		cy.get(
			'.o-grid-col-6:nth-child(2) > .o-form-group > .o-form-group__controls > .c-input-with-icon > .react-datepicker-wrapper > .react-datepicker__input-container > .c-input'
		).type(toDate);
		cy.get('.c-apply-filter-button').click();

		// Set the provider
		cy.get('.c-filter-dropdown-provider .c-checkbox-dropdown__trigger').click();
		cy.get(
			`.o-form-group__controls > .c-checkbox-group > .c-checkbox > label > #${provider}`
		).check('on');
		cy.get('.c-apply-filter-button').click();

		const searchResults = cy.get('.c-search-result');

		// Check number of results
		cy.get('.c-search-result').should('have.length', 10);
		const numberOfResultsParagraph = cy.get(
			'.o-container > .c-toolbar > .c-toolbar__left > .c-toolbar__item > .c-body-1'
		);
		numberOfResultsParagraph.should('contain', '1-10 van ');
		numberOfResultsParagraph.should('contain', ' resultaten');

		// Check result content
		cy.get('.c-search-result').each((searchResult: Cypress.Chainable<HTMLElement>) => {
			searchResult.find('.c-search-result__title a').contains(searchQuery);
			searchResult.find('a.c-body-2').contains(provider);
			const dateString: string = (searchResult
				.find('c-meta-data__item:first-child() p')
				.invoke('text') as unknown) as string;
			const year: number = parseInt(dateString.split('/').pop() || '0', 10);
			const fromYear: number = parseInt(fromDate.split('/').pop() || '0', 10);
			const toYear: number = parseInt(toDate.split('/').pop() || '0', 10);
			expect(year).to.be.within(fromYear, toYear);
		});

		// Check pagination
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

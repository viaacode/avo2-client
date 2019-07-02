import { getSearch, getSearchError, getSearchLoading, getSearchResults } from './selectors';

describe('search > store > selectors', () => {
	const store = {
		search: {
			data: { results: [], count: 0, aggregations: {} },
			loading: false,
			error: false,
		},
	};

	it('Should get the search tree from the store', () => {
		expect(getSearch(store)).toEqual(store.search);
	});

	it('Should get the search error-state from the store', () => {
		expect(getSearchError(store)).toEqual(false);
	});

	it('Should get the search loading-state from the store', () => {
		expect(getSearchLoading(store)).toEqual(false);
	});

	it('Should get the search results from the store', () => {
		expect(getSearchResults(store)).toEqual(store.search.data.results);
	});
});

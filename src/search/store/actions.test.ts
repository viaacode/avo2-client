import { SearchActionTypes } from './types';

import { setSearchResultsError, setSearchResultsLoading, setSearchResultsSuccess } from './actions';

describe('search > store > actions', () => {
	it('Should create an action to set the search results', () => {
		const searchResults = { results: [], count: 0, aggregations: {} };

		const expectedAction = {
			type: SearchActionTypes.SET_RESULTS_SUCCESS,
			data: searchResults,
		};

		expect(setSearchResultsSuccess(searchResults)).toMatchObject(expectedAction);
	});

	it('Should create an action to set an error', () => {
		const expectedAction = {
			type: SearchActionTypes.SET_RESULTS_ERROR,
			error: true,
		};

		expect(setSearchResultsError()).toMatchObject(expectedAction);
	});

	it('Should create an action to set the loading state', () => {
		const expectedAction = {
			type: SearchActionTypes.SET_RESULTS_LOADING,
			loading: true,
		};

		expect(setSearchResultsLoading()).toMatchObject(expectedAction);
	});
});

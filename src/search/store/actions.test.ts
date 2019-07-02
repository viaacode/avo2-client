import { SearchActionTypes } from './types';

import { SetSearchResultsError, SetSearchResultsLoading, SetSearchResultsSuccess } from './actions';

describe('search > store > actions', () => {
	it('Should create an action to set the search results', () => {
		const searchResults = { results: [], count: 0, aggregations: {} };

		const expectedAction = {
			type: SearchActionTypes.SET_RESULTS_SUCCESS,
			data: searchResults,
		};

		expect(SetSearchResultsSuccess(searchResults)).toMatchObject(expectedAction);
	});

	it('Should create an action to set an error', () => {
		const expectedAction = {
			type: SearchActionTypes.SET_RESULTS_ERROR,
			error: true,
		};

		expect(SetSearchResultsError()).toMatchObject(expectedAction);
	});

	it('Should create an action to set the loading state', () => {
		const expectedAction = {
			type: SearchActionTypes.SET_RESULTS_LOADING,
			loading: true,
		};

		expect(SetSearchResultsLoading()).toMatchObject(expectedAction);
	});
});

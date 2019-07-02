import { SetSearchResultsError, SetSearchResultsLoading, SetSearchResultsSuccess } from './actions';
import initialState from './initial-state';
import { SearchActionTypes } from './types';

import searchReducer from './reducer';

describe('search > store > reducer', () => {
	it(`Correctly handle ${SearchActionTypes.SET_RESULTS_ERROR}`, () => {
		const state = searchReducer(initialState, SetSearchResultsError());

		expect(state.error).toEqual(true);
	});

	it(`Correctly handle ${SearchActionTypes.SET_RESULTS_LOADING}`, () => {
		const state = searchReducer(initialState, SetSearchResultsLoading());

		expect(state.loading).toEqual(true);
	});

	it(`Correctly handle ${SearchActionTypes.SET_RESULTS_SUCCESS}`, () => {
		const payload = { results: [], count: 0, aggregations: {} };

		const state = searchReducer(initialState, SetSearchResultsSuccess(payload));

		expect(state.data).toEqual(payload);
	});
});

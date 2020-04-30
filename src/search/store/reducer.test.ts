import { setSearchResultsError, setSearchResultsLoading, setSearchResultsSuccess } from './actions';
import initialState from './initial-state';
import searchReducer from './reducer';
import { SearchActionTypes } from './types';

describe('search > store > reducer', () => {
	it(`Correctly handle ${SearchActionTypes.SET_RESULTS_ERROR}`, () => {
		const state = searchReducer(initialState, setSearchResultsError());

		expect(state.error).toEqual(true);
	});

	it(`Correctly handle ${SearchActionTypes.SET_RESULTS_LOADING}`, () => {
		const state = searchReducer(initialState, setSearchResultsLoading());

		expect(state.loading).toEqual(true);
	});

	it(`Correctly handle ${SearchActionTypes.SET_RESULTS_SUCCESS}`, () => {
		const payload = { results: [], count: 0, aggregations: {} };

		const state = searchReducer(initialState, setSearchResultsSuccess(payload));

		expect(state.data).toEqual(payload);
	});
});

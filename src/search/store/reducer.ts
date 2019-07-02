import { createReducer } from './../../shared/helpers/redux/create-reducer';

import initialState from './initial-state';
import {
	SearchActionTypes,
	SetSearchResultsAction,
	SetSearchResultsErrorAction,
	SetSearchResultsLoadingAction,
} from './types';

const searchReducer = createReducer(initialState, {
	[SearchActionTypes.SET_RESULTS_LOADING]: (state, action: SetSearchResultsLoadingAction) => ({
		...state,
		results: null,
		loading: action.loading,
		error: false,
	}),
	[SearchActionTypes.SET_RESULTS_SUCCESS]: (state, action: SetSearchResultsAction) => ({
		...state,
		results: action.results,
		loading: false,
		error: false,
	}),
	[SearchActionTypes.SET_RESULTS_ERROR]: (state, action: SetSearchResultsErrorAction) => ({
		...state,
		results: null,
		loading: false,
		error: action.error,
	}),
});

export default searchReducer;

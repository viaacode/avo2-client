import { createReducer } from './../../shared/helpers';

import initialState from './initial-state';
import {
	SearchActionTypes,
	SetSearchResultsErrorAction,
	SetSearchResultsLoadingAction,
	SetSearchResultsSuccessAction,
} from './types';

const searchReducer = createReducer(initialState, {
	[SearchActionTypes.SET_RESULTS_LOADING]: (state, action: SetSearchResultsLoadingAction) => ({
		...state,
		data: null,
		loading: action.loading,
		error: false,
	}),
	[SearchActionTypes.SET_RESULTS_SUCCESS]: (state, action: SetSearchResultsSuccessAction) => ({
		...state,
		data: action.data,
		loading: false,
		error: false,
	}),
	[SearchActionTypes.SET_RESULTS_ERROR]: (state, action: SetSearchResultsErrorAction) => ({
		...state,
		data: null,
		loading: false,
		error: action.error,
	}),
});

export default searchReducer;

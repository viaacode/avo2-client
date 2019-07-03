import { Avo } from '@viaa/avo2-types';

import {
	SearchActionTypes,
	SetSearchResultsErrorAction,
	SetSearchResultsLoadingAction,
	SetSearchResultsSuccessAction,
} from './types';

const setSearchResultsSuccess = (data: Avo.Search.Response): SetSearchResultsSuccessAction => ({
	data,
	type: SearchActionTypes.SET_RESULTS_SUCCESS,
});

const setSearchResultsError = (): SetSearchResultsErrorAction => ({
	type: SearchActionTypes.SET_RESULTS_ERROR,
	error: true,
});

const setSearchResultsLoading = (): SetSearchResultsLoadingAction => ({
	type: SearchActionTypes.SET_RESULTS_LOADING,
	loading: true,
});

export { setSearchResultsSuccess, setSearchResultsError, setSearchResultsLoading };

import { Avo } from '@viaa/avo2-types';

import {
	SearchActionTypes,
	SetSearchResultsErrorAction,
	SetSearchResultsLoadingAction,
	SetSearchResultsSuccessAction,
} from './types';

const SetSearchResultsSuccess = (results: Avo.Search.Response): SetSearchResultsSuccessAction => ({
	results,
	type: SearchActionTypes.SET_RESULTS_SUCCESS,
});

const SetSearchResultsError = (): SetSearchResultsErrorAction => ({
	type: SearchActionTypes.SET_RESULTS_ERROR,
	error: true,
});

const SetSearchResultsLoading = (): SetSearchResultsLoadingAction => ({
	type: SearchActionTypes.SET_RESULTS_LOADING,
	loading: true,
});

export { SetSearchResultsSuccess, SetSearchResultsError, SetSearchResultsLoading };

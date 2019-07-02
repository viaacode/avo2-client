import { Avo } from '@viaa/avo2-types';
import { ActionCreator } from 'redux';

import {
	SearchActionTypes,
	SetSearchResultsAction,
	SetSearchResultsErrorAction,
	SetSearchResultsLoadingAction,
} from './types';

const SetSearchResults: ActionCreator<SetSearchResultsAction> = (results: Avo.Search.Response) => ({
	results,
	type: SearchActionTypes.SET_RESULTS_SUCCESS,
});

const SetSearchResultsError: ActionCreator<SetSearchResultsErrorAction> = () => ({
	type: SearchActionTypes.SET_RESULTS_ERROR,
	error: true,
});

const SetSearchResultsLoading: ActionCreator<SetSearchResultsLoadingAction> = () => ({
	type: SearchActionTypes.SET_RESULTS_LOADING,
	loading: true,
});

export { SetSearchResults, SetSearchResultsError, SetSearchResultsLoading };

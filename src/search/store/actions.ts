import { Avo } from '@viaa/avo2-types';
import { Action, Dispatch } from 'redux';

import { CustomWindow } from '../../shared/types/CustomWindow';
import {
	SearchActionTypes,
	SetSearchResultsErrorAction,
	SetSearchResultsLoadingAction,
	SetSearchResultsSuccessAction,
} from './types';

const getSearchResults = (
	orderProperty: Avo.Search.OrderProperty = 'relevance',
	orderDirection: Avo.Search.OrderDirection = 'desc',
	from: number = 0,
	size: number = 30,
	filters?: Partial<Avo.Search.Filters>,
	filterOptionSearch?: Partial<Avo.Search.FilterOption>
) => {
	return async (dispatch: Dispatch): Promise<Action> => {
		dispatch(setSearchResultsLoading());

		try {
			const response = await fetch(`${(window as CustomWindow)._ENV_.PROXY_URL}/search`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					filters,
					filterOptionSearch,
					orderProperty,
					orderDirection,
					from,
					size,
				}),
			});

			const data = await response.json();

			return dispatch(setSearchResultsSuccess(data as Avo.Search.Response));
		} catch (e) {
			return dispatch(setSearchResultsError());
		}
	};
};

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

export {
	setSearchResultsSuccess,
	setSearchResultsError,
	setSearchResultsLoading,
	getSearchResults,
};

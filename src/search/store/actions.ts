import { Avo } from '@viaa/avo2-types';
import { Action, Dispatch } from 'redux';

import { CustomError } from '../../shared/helpers';

import { fetchSearchResults } from '../search.service';
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
			const response = await fetchSearchResults(
				orderProperty,
				orderDirection,
				from,
				size,
				filters,
				filterOptionSearch
			);

			const data = await response.json();

			if (data.statusCode) {
				console.error(
					JSON.stringify(
						new CustomError('Failed to get search results from elasticsearch', data, {
							orderProperty,
							orderDirection,
							from,
							size,
							filters,
							filterOptionSearch,
						}),
						null,
						2
					)
				);
				return dispatch(setSearchResultsError());
			}

			return dispatch(setSearchResultsSuccess(data as Avo.Search.Search));
		} catch (e) {
			return dispatch(setSearchResultsError());
		}
	};
};

const setSearchResultsSuccess = (data: Avo.Search.Search): SetSearchResultsSuccessAction => ({
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

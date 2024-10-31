import { type Avo } from '@viaa/avo2-types';
import { type Action, type Dispatch } from 'redux';

import { DEFAULT_AUDIO_STILL } from '../../shared/constants';
import { CustomError } from '../../shared/helpers';
import { fetchSearchResults } from '../search.service';

import {
	SearchActionTypes,
	type SetSearchResultsControllerAction,
	type SetSearchResultsErrorAction,
	type SetSearchResultsLoadingAction,
	type SetSearchResultsSuccessAction,
} from './types';

export const getSearchResults = (
	orderProperty: Avo.Search.OrderProperty = 'relevance',
	orderDirection: Avo.Search.OrderDirection = 'desc',
	from = 0,
	size: number,
	filters?: Partial<Avo.Search.Filters>,
	filterOptionSearch?: Partial<Avo.Search.FilterOption>
) => {
	return async (dispatch: Dispatch): Promise<Action> => {
		dispatch(setSearchResultsLoading());

		try {
			const [request, controller] = fetchSearchResults(
				orderProperty,
				orderDirection,
				from,
				size,
				filters,
				filterOptionSearch
			);

			dispatch(setSearchResultsControllerAction(controller));

			const data = await request;

			if ((data as any)?.statusCode) {
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

			const processedData = {
				...data,
				results:
					data.results?.map((result: Avo.Search.ResultItem) => {
						if (result.administrative_type === 'audio') {
							result.thumbnail_path = DEFAULT_AUDIO_STILL;
						}

						return result;
					}) || [],
			};

			return dispatch(setSearchResultsSuccess(processedData as Avo.Search.Search));
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

const setSearchResultsControllerAction = (
	controller: AbortController
): SetSearchResultsControllerAction => ({
	type: SearchActionTypes.SET_RESULTS_CONTROLLER,
	controller,
});

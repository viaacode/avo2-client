import { type Avo } from '@viaa/avo2-types';
import { atom } from 'jotai';

import { type LoginState } from '../authentication/authentication.types.js';
import { DEFAULT_AUDIO_STILL } from '../shared/constants/index.js';
import { CustomError } from '../shared/helpers/custom-error.js';

import { fetchSearchResults } from './search.service.js';
import { type SearchState } from './search.types.js';

export const searchAtom = atom<SearchState>({
	data: null,
	loading: false,
	error: null,
});

export const getSearchResultsAtom = atom<
	LoginState | null,
	[
		Avo.Search.OrderProperty,
		Avo.Search.OrderDirection,
		number,
		number,
		Partial<Avo.Search.Filters> | undefined,
		Partial<Avo.Search.FilterOption> | undefined,
	],
	void
>(
	null,
	async (
		get,
		set,
		orderProperty = 'relevance',
		orderDirection = 'desc',
		from = 0,
		size: number,
		filters,
		filterOptionSearch
	) => {
		set(searchAtom, {
			...get(searchAtom),
			loading: true,
		});

		try {
			const data = await fetchSearchResults(
				orderProperty,
				orderDirection,
				from,
				size,
				filters,
				filterOptionSearch
			);

			if ((data as any)?.statusCode) {
				console.error(
					new CustomError('Failed to get search results from elasticsearch', data, {
						orderProperty,
						orderDirection,
						from,
						size,
						filters,
						filterOptionSearch,
					})
				);

				set(searchAtom, {
					...get(searchAtom),
					error: true,
				});
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

			set(searchAtom, {
				...get(searchAtom),
				data: processedData,
				loading: false,
				error: false,
			});
		} catch (err) {
			set(searchAtom, {
				...get(searchAtom),
				error: err,
			});
		}
	}
);

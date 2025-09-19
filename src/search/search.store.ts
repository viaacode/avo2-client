import { type Avo } from '@viaa/avo2-types';
import { atom } from 'jotai';

import { DEFAULT_AUDIO_STILL } from '../shared/constants';
import { CustomError } from '../shared/helpers/custom-error';
import type { LoginState, SearchState } from '../store/store.types';

import { fetchSearchResults } from './search.service';

export const searchAtom = atom<SearchState>({
	data: null,
	loading: false,
	error: false,
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
			});
		} catch (e) {
			set(searchAtom, {
				...get(searchAtom),
				error: true,
			});
		}
	}
);

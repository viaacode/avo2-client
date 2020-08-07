import { Avo } from '@viaa/avo2-types';

import { getEnv } from '../shared/helpers';
import { fetchWithLogout } from '../shared/helpers/fetch-with-logout';

export const fetchSearchResults = async (
	orderProperty: Avo.Search.OrderProperty = 'relevance',
	orderDirection: Avo.Search.OrderDirection = 'desc',
	from: number = 0,
	size: number = 30,
	filters?: Partial<Avo.Search.Filters>,
	filterOptionSearch?: Partial<Avo.Search.FilterOption>,
	requestedAggs?: Avo.Search.FilterProp[],
	onlyAggs: boolean = false,
	aggsSize?: number
) => {
	const response = await fetchWithLogout(`${getEnv('PROXY_URL')}/search`, {
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
			requestedAggs,
			onlyAggs,
			aggsSize,
		}),
	});

	return response.json();
};

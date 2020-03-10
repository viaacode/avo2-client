import { Avo } from '@viaa/avo2-types';

import { getEnv } from '../shared/helpers';

export const fetchSearchResults = (
	orderProperty: Avo.Search.OrderProperty = 'relevance',
	orderDirection: Avo.Search.OrderDirection = 'desc',
	from: number = 0,
	size: number = 30,
	filters?: Partial<Avo.Search.Filters>,
	filterOptionSearch?: Partial<Avo.Search.FilterOption>
) =>
	fetch(`${getEnv('PROXY_URL')}/search`, {
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

import { Avo } from '@viaa/avo2-types';

export async function doSearch(
	filters?: Partial<Avo.Search.Filters>,
	filterOptionSearch?: Partial<Avo.Search.FilterOption>,
	orderProperty: Avo.Search.OrderProperty = 'relevance',
	orderDirection: Avo.Search.OrderDirection = 'desc',
	from: number = 0,
	size: number = 30
): Promise<Avo.Search.Response> {
	const url = `${process.env.REACT_APP_PROXY_URL}/search`;
	const body: Avo.Search.Request = {
		filters,
		filterOptionSearch,
		orderProperty,
		orderDirection,
		from,
		size,
	};
	return fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	}).then(response => response.json()) as Promise<Avo.Search.Response>;
}

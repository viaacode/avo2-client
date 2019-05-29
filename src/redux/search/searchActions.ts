import { Filters, SearchRequest, SearchResponse } from '../../types';

export async function doSearch(
	filters?: Partial<Filters>,
	from: number = 0,
	size: number = 30
): Promise<SearchResponse> {
	const url = `${process.env.REACT_APP_PROXY_URL}/search/search`;
	const body: SearchRequest = {
		filters,
		from,
		size,
	};
	return fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	}).then(response => response.json()) as Promise<SearchResponse>;
}

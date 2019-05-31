import {
	Filters,
	SearchOrderDirection,
	SearchOrderProperty,
	SearchRequest,
	SearchResponse,
} from '../../types';

export async function doSearch(
	filters?: Partial<Filters>,
	orderProperty: SearchOrderProperty = 'relevance',
	orderDirection: SearchOrderDirection = 'desc',
	from: number = 0,
	size: number = 30
): Promise<SearchResponse> {
	const url = `${process.env.REACT_APP_PROXY_URL}/search/search`;
	const body: SearchRequest = {
		filters,
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
	}).then(response => response.json()) as Promise<SearchResponse>;
}

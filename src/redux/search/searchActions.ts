import { IFilterResponse, IFilters } from '../../types';

export async function doSearch(
	filters: Partial<IFilters>,
	from: number = 0,
	size: number = 30
): Promise<IFilterResponse> {
	const url = `${process.env.REACT_APP_PROXY_URL}/search`;
	return fetch(url, {
		method: 'POST',
		body: JSON.stringify({
			filters,
			from,
			size,
		}),
	}).then(response => response.json()) as Promise<IFilterResponse>;
}

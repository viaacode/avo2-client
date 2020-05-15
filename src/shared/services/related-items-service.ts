import { stringify } from 'query-string';

import { Avo } from '@viaa/avo2-types';

import { CustomError, getEnv } from '../helpers';
import { fetchWithLogout } from '../helpers/fetch-with-logout';

export async function getRelatedItems(
	id: string | number,
	type: 'items' | 'collections' | 'bundles',
	limit: number = 5
): Promise<Avo.Search.ResultItem[]> {
	let url: string | undefined;
	let body: any | undefined;
	try {
		url = `${getEnv('PROXY_URL')}/search/related?${stringify({
			id,
			type,
			limit,
		})}`;
		body = {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
		};
		const response = await fetchWithLogout(url, body);

		return (await response.json()).results;
	} catch (err) {
		throw new CustomError('Failed to get related items', err, {
			id,
			url,
			body,
			limit,
		});
	}
}

import { stringify } from 'querystring';

import { Avo } from '@viaa/avo2-types';

import { getEnv } from '../helpers/env';

export async function getRelatedItems(
	id: string | number,
	index: 'both' | 'items' | 'collections',
	limit: number = 5
): Promise<Avo.Search.ResultItem[]> {
	try {
		const response = await fetch(
			`${getEnv('PROXY_URL')}/search/related?${stringify({
				id,
				index,
				limit,
			})}`,
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		const results: Avo.Search.Search = await response.json();
		return results.results;
	} catch (err) {
		throw new Error('Failed to get video stills');
	}
}

import { stringify } from 'querystring';

import { Avo } from '@viaa/avo2-types';

import { CustomError, getEnv } from '../helpers';

export async function getRelatedItems(
	id: string | number,
	index: 'both' | 'items' | 'collections' | 'bundles',
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

		return (await response.json()).results;
	} catch (err) {
		throw new CustomError('Failed to get video stills', err, {
			id,
			index,
			limit,
		});
	}
}

import { stringify } from 'querystring';

import { Avo } from '@viaa/avo2-types';

import { getEnv } from '../helpers/env';
import { CustomError } from '../helpers/error';

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

		return (await response.json()).results;
	} catch (err) {
		throw new CustomError('Failed to get video stills', err, {
			id,
			index,
			limit,
		});
	}
}

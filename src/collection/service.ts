import queryString from 'query-string';

import { Avo } from '@viaa/avo2-types';

import { getEnv } from '../shared/helpers/env';

export async function getVideoStills(
	externalIds: string[] | string,
	numberOfStills: number
): Promise<Avo.Stills.StillInfo[]> {
	try {
		const query: string = queryString.stringify({
			numberOfStills,
			externalIds:
				typeof externalIds === 'string' ? [externalIds].join(',') : externalIds.join(','),
		});
		const response = await fetch(`${getEnv('PROXY_URL')}/video-stills?${query}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		return await response.json();
	} catch (err) {
		throw new Error('Failed to get video stills');
	}
}

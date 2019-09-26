import queryString from 'query-string';

import { Avo } from '@viaa/avo2-types';

import { getEnv } from '../helpers/env';

export const getVideoStills = async (
	stillRequests: Avo.Stills.StillRequest[]
): Promise<Avo.Stills.StillInfo[]> => {
	try {
		const response = await fetch(`${getEnv('PROXY_URL')}/video-stills`, {
			method: 'POST',
			body: queryString.stringify(stillRequests),
			headers: {
				'Content-Type': 'application/json',
			},
		});

		return await response.json();
	} catch (err) {
		throw new Error('Failed to get video stills');
	}
};

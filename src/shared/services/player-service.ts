import { getEnv } from '../../shared/helpers/env';

export type PlayerTokenResponse = {
	url: string;
};

export const fetchPlayerToken = async (externalId: string): Promise<string> => {
	try {
		const url = `${getEnv('PROXY_URL')}/player-ticket?externalId=${externalId}`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		});

		const data: PlayerTokenResponse = await response.json();

		return data.url;
	} catch (err) {
		console.error('Failed to fetch player token', err, { externalId });
		throw new Error('Failed to fetch player token');
	}
};

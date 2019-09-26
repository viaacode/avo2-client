import { getEnv } from '../../shared/helpers/env';

export type PlayerTokenResponse = {
	url: string;
};

export const fetchPlayerToken = async (externalId: string) => {
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
};

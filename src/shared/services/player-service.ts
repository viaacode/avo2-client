import { CustomWindow } from '../../shared/types/global';

export type PlayerTokenResponse = {
	url: string;
};

export const fetchPlayerToken = async (externalId: string) => {
	const url = `${(window as CustomWindow)._ENV_.PROXY_URL}/player-ticket?externalId=${externalId}`;

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
	});

	const data = await response.json();

	return data.url as PlayerTokenResponse;
};

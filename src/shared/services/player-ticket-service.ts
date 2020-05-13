import { CustomError, getEnv } from '../helpers';
import { fetchWithLogout } from '../helpers/fetch-with-logout';

export type PlayerTicketResponse = {
	url: string;
};

export const fetchPlayerTicket = async (externalId: string): Promise<string> => {
	try {
		const url = `${getEnv('PROXY_URL')}/player-ticket?externalId=${externalId}`;

		const response = await fetchWithLogout(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		});

		const data: PlayerTicketResponse = await response.json();

		return data.url;
	} catch (err) {
		throw new CustomError('Failed to get player ticket', err, { externalId });
	}
};

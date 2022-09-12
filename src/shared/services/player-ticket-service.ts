import { CustomError, getEnv } from '../helpers';
import { fetchWithLogout } from '../helpers/fetch-with-logout';

export type PlayerTicketResponse = {
	urls: string[];
};

export const fetchPlayerTicket = async (externalId: string): Promise<string> => {
	return (await fetchPlayerTickets([externalId]))[0];
};

export const fetchPlayerTickets = async (externalIds: string[]): Promise<string[]> => {
	try {
		const url = `${getEnv('PROXY_URL')}/player-ticket?externalIds=${externalIds}`;

		const response = await fetchWithLogout(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		});

		const data: PlayerTicketResponse = await response.json();

		return data.urls;
	} catch (err) {
		throw new CustomError('Failed to get player tickets', err, { externalIds });
	}
};

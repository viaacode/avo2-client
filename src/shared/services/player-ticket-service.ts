import { CustomError, getEnv } from '../helpers';

export type PlayerTicketResponse = {
	url: string;
};

export const fetchPlayerTicket = async (externalId: string): Promise<string> => {
	try {
		const url = `${getEnv('PROXY_URL')}/player-ticket?externalId=${externalId}`;

		const response = await fetch(url, {
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

import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/dist/client.mjs';

import { CustomError, getEnv } from '../helpers';

export const fetchPlayerTicket = async (externalId: string): Promise<string> => {
	return (await fetchPlayerTickets([externalId]))[0];
};

export const fetchPlayerTickets = async (externalIds: string[]): Promise<string[]> => {
	try {
		const url = `${getEnv('PROXY_URL')}/admin/player-ticket?externalIds=${externalIds}`;

		return fetchWithLogoutJson<string[]>(url);
	} catch (err) {
		throw new CustomError('Failed to get player tickets', err, { externalIds });
	}
};

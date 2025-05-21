import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/dist/client.mjs';

import { EmbedCodeService } from '../../embed-code/embed-code-service';
import { CustomError } from '../helpers/custom-error';
import { getEnv } from '../helpers/env';

export const fetchPlayerTicket = async (externalId: string): Promise<string> => {
	return (await fetchPlayerTickets([externalId]))[0];
};

export const fetchPlayerTickets = async (externalIds: string[]): Promise<string[]> => {
	try {
		const url = `${getEnv('PROXY_URL')}/admin/player-ticket?externalIds=${externalIds}`;

		const ltiJwtToken = EmbedCodeService.getJwtTokenFromUrl();
		return fetchWithLogoutJson<string[]>(url, {
			headers: {
				authorization: ltiJwtToken ? `Bearer ${ltiJwtToken}` : '',
			},
		});
	} catch (err) {
		throw new CustomError('Failed to get player tickets', err, { externalIds });
	}
};

import { Tickets } from 'node-zendesk';

import { getEnv } from '../helpers';
import { fetchWithLogout } from '../helpers/fetch-with-logout';

export class ZendeskService {
	public static async createTicket(ticket: Tickets.CreateModel): Promise<Tickets.ResponseModel> {
		const response = await fetchWithLogout(`${getEnv('PROXY_URL')}/zendesk`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify(ticket),
		});
		if (response.status < 200 || response.status >= 400) {
			throw response;
		}
		return await response.json();
	}
}

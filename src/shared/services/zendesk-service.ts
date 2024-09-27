import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/dist/client.mjs';
// eslint-disable-next-line import/no-unresolved
import { type Requests } from 'node-zendesk';

import { getEnv } from '../helpers';

export class ZendeskService {
	public static async createTicket(
		request: Requests.CreateModel
	): Promise<Requests.ResponseModel> {
		return fetchWithLogoutJson<Requests.ResponseModel>(`${getEnv('PROXY_URL')}/zendesk`, {
			method: 'POST',
			body: JSON.stringify(request),
		});
	}
}

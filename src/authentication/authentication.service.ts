import { Tickets } from 'node-zendesk';
import { getEnv } from '../shared/helpers';

export async function createZendeskTicket(
	ticket: Tickets.CreateModel
): Promise<Tickets.ResponseModel> {
	const response = await fetch(`${getEnv('PROXY_URL')}/zendesk`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify(ticket),
	});
	if (response.status < 200 && response.status >= 400) {
		throw response;
	}
	const data = await response.json();

	console.log(data);
	return data;
}

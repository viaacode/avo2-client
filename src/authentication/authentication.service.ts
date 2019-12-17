import { Tickets } from 'node-zendesk';
import { getEnv } from '../shared/helpers';
import queryString from 'query-string';

import {
	StamboekValidationStatuses,
	ValidateStamboekResponse,
} from '@viaa/avo2-types/types/stamboek/types';

import { getEnv } from '../shared/helpers';

const stamboekValidationCache: {
	[stamboekNumber: string]: boolean;
} = {};

export async function verifyStamboekNumber(
	stamboekNumber: string
): Promise<StamboekValidationStatuses> {
	if (stamboekValidationCache[stamboekNumber]) {
		return 'VALID';
	}
	const response = await fetch(
		`${getEnv('PROXY_URL')}/stamboek/validate?${queryString.stringify({
			stamboekNumber,
		})}`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		}
	);

	const data: ValidateStamboekResponse = await response.json();
	if (data.status === 'VALID') {
		// Cache values as much as possible, to avoid multiple requests to the stamboek api
		stamboekValidationCache[stamboekNumber] = true;
	}
	return data.status;
}

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

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

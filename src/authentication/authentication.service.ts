import { get } from 'lodash-es';
import queryString from 'query-string';

import { Avo } from '@viaa/avo2-types';

import { getEnv } from '../shared/helpers';

import { SpecialPermissionGroups } from './authentication.types';

const stamboekValidationCache: {
	[stamboekNumber: string]: boolean;
} = {};

export async function verifyStamboekNumber(
	stamboekNumber: string
): Promise<Avo.Stamboek.ValidationStatuses> {
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

	const data: Avo.Stamboek.ValidateResponse = await response.json();
	if (data.status === 'VALID') {
		// Cache values as much as possible, to avoid multiple requests to the stamboek api
		stamboekValidationCache[stamboekNumber] = true;
	}
	return data.status;
}

export function getUserGroupIds(user: Avo.User.User | null | undefined): number[] {
	return [
		...get(user, 'profile.userGroupIds', []),
		user ? SpecialPermissionGroups.loggedInUsers : SpecialPermissionGroups.loggedOutUsers,
	];
}

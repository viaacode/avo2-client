import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/dist/client.mjs';
import { type Avo } from '@viaa/avo2-types';
import queryString from 'query-string';

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
	const data = await fetchWithLogoutJson<Avo.Stamboek.ValidateResponse>(
		`${getEnv('PROXY_URL')}/stamboek/validate?${queryString.stringify({
			stamboekNumber,
		})}`
	);
	if (!data) {
		throw new Error(
			JSON.stringify({
				message: 'Failed to validate stamboek number',
				additionalInfo: { stamboekNumber },
			})
		);
	}
	if (data.status === 'VALID') {
		// Cache values as much as possible, to avoid multiple requests to the stamboek api
		stamboekValidationCache[stamboekNumber] = true;
	}
	return data.status;
}

export function getUserGroupIds(user: Avo.User.User | null | undefined): string[] {
	return [
		...(user?.profile?.userGroupIds ?? []).map((groupId) => String(groupId)),
		user ? SpecialPermissionGroups.loggedInUsers : SpecialPermissionGroups.loggedOutUsers,
	];
}

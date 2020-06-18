import { Avo } from '@viaa/avo2-types';

import { CustomError, getEnv } from '../shared/helpers';
import { fetchWithLogout } from '../shared/helpers/fetch-with-logout';

interface UpdateProfileValues {
	educationLevels: {
		profile_id: string;
		key: string;
	}[];
	subjects: {
		profile_id: string;
		key: string;
	}[];
	organizations: {
		profile_id: string;
		organization_id: string;
		unit_id: string | null;
	}[];
	alias: string;
	alternativeEmail: string;
	avatar: string | null;
	bio: string | null;
	location: string;
	stamboek: string | null;
}

export const updateProfileInfo = async (
	profile: Avo.User.Profile | null,
	variables: Partial<UpdateProfileValues>
): Promise<void> => {
	try {
		if (!profile) {
			return;
		}
		const response = await fetchWithLogout(`${getEnv('PROXY_URL')}/profile`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify(variables),
		});
		if (response.status < 200 || response.status >= 400) {
			throw new CustomError(
				"Failed to update profile because response status wasn't in the valid range",
				null,
				{ response }
			);
		}
	} catch (err) {
		throw new CustomError('Failed to update profile information', err, {
			profile,
			variables,
		});
	}
};

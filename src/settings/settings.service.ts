import { Avo } from '@viaa/avo2-types';

import { CustomError, getEnv } from '../shared/helpers';

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
	function: string | null;
	location: string;
	stamboek: string | null;
}

export const updateProfileInfo = async (
	profile: Avo.User.Profile,
	variables: Partial<UpdateProfileValues>
): Promise<void> => {
	try {
		const response = await fetch(`${getEnv('PROXY_URL')}/profile`, {
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
		console.error('Failed to update profile information', err, { profile, variables });
		throw err;
	}
};

export const fetchMailPreferences = async (email: string) => {
	const response = await fetch(
		`${getEnv('PROXY_URL')}/campaign-monitor/preferences?email=${email}`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		}
	);

	return response.json();
};

export const updateMailPreferences = async (email: string, preferences: string) => {
	const response = await fetch(`${getEnv('PROXY_URL')}/campaign-monitor/preferences`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify({ email, preferences }),
	});

	return response.json();
};

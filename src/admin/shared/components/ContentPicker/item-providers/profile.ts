import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/client';
import { type Avo } from '@viaa/avo2-types';
import { stringifyUrl } from 'query-string';

import { CustomError } from '../../../../../shared/helpers/custom-error';
import { getEnv } from '../../../../../shared/helpers/env';
import { type PickerItem } from '../../../types/content-picker';
import { parsePickerItem } from '../helpers/parse-picker';

// Fetch profiles from GQL
export const retrieveProfiles = async (name: string | null, limit = 5): Promise<PickerItem[]> => {
	try {
		return await getUsers(limit, name);
	} catch (err) {
		throw new CustomError('Failed to get profiles for content picker', err, { name, limit });
	}
};

// Convert profiles to react-select options
const parseProfiles = (users: Partial<Avo.User.CommonUser>[]): PickerItem[] => {
	return users.map(
		(user): PickerItem => ({
			...parsePickerItem('PROFILE', user.profileId as string),
			label: `${user.fullName} (${user.email})`,
		})
	);
};

async function getUsers(limit: number, partialName: string | null): Promise<PickerItem[]> {
	const url = stringifyUrl({
		url: `${getEnv('PROXY_URL')}/user/get-names-and-emails`,
		query: {
			offset: 0,
			limit,
			name: partialName,
		},
	});
	const users = await fetchWithLogoutJson<Partial<Avo.User.CommonUser>[]>(url);

	return parseProfiles(users);
}

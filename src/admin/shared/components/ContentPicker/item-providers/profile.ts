import { Avo } from '@viaa/avo2-types';
import { UserSchema } from '@viaa/avo2-types/types/user';

import {
	PermissionName,
	PermissionService,
} from '../../../../../authentication/helpers/permission-service';
import { CustomError } from '../../../../../shared/helpers';
import { UserService } from '../../../../users/user.service';
import { PickerSelectItem } from '../../../types';
import { parsePickerItem } from '../helpers/parse-picker';

const shouldFetchUsersInCompany = (user?: UserSchema) => {
	return (
		user &&
		PermissionService.hasPerm(user, PermissionName.VIEW_USERS_IN_SAME_COMPANY) &&
		!PermissionService.hasPerm(user, PermissionName.EDIT_ANY_USER)
	);
};

// Fetch profiles from GQL
export const retrieveProfiles = async (
	name: string | null,
	limit: number = 5,
	user?: UserSchema
): Promise<PickerSelectItem[]> => {
	try {
		const where = {
			...(!!name
				? {
						_or: [
							{ full_name: { _ilike: `%${name}%` } },
							{ mail: { _ilike: `%${name}%` } },
						],
				  }
				: {}),
		};

		const response: [Avo.User.Profile[], number] = await (shouldFetchUsersInCompany(user)
			? UserService.getCompanyProfiles(
					0,
					'last_access_at',
					'desc',
					'dateTime',
					where,
					user,
					limit
			  )
			: UserService.getProfiles(0, 'last_access_at', 'desc', 'dateTime', where, limit));

		return parseProfiles(response[0]);
	} catch (err) {
		throw new CustomError('Failed to get profiles for content picker', err, { name, limit });
	}
};

// Convert profiles to react-select options
const parseProfiles = (profiles: Avo.User.Profile[]): PickerSelectItem[] => {
	return profiles.map(
		(profile): PickerSelectItem => ({
			label: `${profile.user.full_name} (${profile.user.mail})`,
			value: parsePickerItem('PROFILE', profile.id),
		})
	);
};

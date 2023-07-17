import { UserService } from '@meemoo/admin-core-ui';
import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '../../../shared/constants/query-keys';

export const useGetUserById = (
	profileId: string,
	options: {
		enabled: boolean;
	} = { enabled: true }
) => {
	return useQuery(
		[QUERY_KEYS.GET_USER_BY_ID, profileId, options],
		() => {
			return UserService.getUserById(profileId);
		},
		options
	);
};

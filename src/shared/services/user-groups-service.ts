import { get } from 'lodash-es';

import { CustomError } from '../helpers/error';
import { GET_USER_GROUPS } from '../queries/user-groups.gql';
import { dataService } from './data-service';

interface GetUserGroupsResponse {
	data: {
		users_groups: UserGroup[];
	};
}

export interface UserGroup {
	id: number;
	label: string;
}

export async function getUserGroups(): Promise<UserGroup[]> {
	try {
		const response: GetUserGroupsResponse = await dataService.query({
			query: GET_USER_GROUPS,
		});

		return get(response, 'data.users_groups', []);
	} catch (err) {
		throw new CustomError('Failed to get user groups', err);
	}
}

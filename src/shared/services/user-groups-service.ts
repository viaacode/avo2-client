import { capitalize, get, sortBy } from 'lodash-es';

import { TagInfo } from '@viaa/avo2-components';

import { SpecialPermissionGroups } from '../../authentication/authentication.types';

import { CustomError } from '../helpers';
import { GET_USER_GROUPS } from '../queries/user-groups.gql';
import i18n from '../translations/i18n';

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

export async function fetchAllUserGroups(): Promise<TagInfo[]> {
	try {
		const response: GetUserGroupsResponse = await dataService.query({
			query: GET_USER_GROUPS,
		});

		return [
			{
				label: i18n.t(
					'admin/menu/components/menu-edit-form/menu-edit-form___niet-ingelogde-gebruikers'
				),
				value: SpecialPermissionGroups.loggedOutUsers,
			},
			{
				label: i18n.t(
					'admin/menu/components/menu-edit-form/menu-edit-form___ingelogde-gebruikers'
				),
				value: SpecialPermissionGroups.loggedInUsers,
			},
			...sortBy(
				get(response, 'data.users_groups', []).map(
					(userGroup: UserGroup): TagInfo => ({
						label: capitalize(userGroup.label),
						value: userGroup.id,
					})
				),
				'label'
			),
		];
	} catch (err) {
		throw new CustomError('Failed to get user groups', err);
	}
}

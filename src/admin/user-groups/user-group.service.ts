import { Avo } from '@viaa/avo2-types';
import { get, isNil, orderBy, uniqBy } from 'lodash-es';

import {
	DeleteUserGroupDocument,
	DeleteUserGroupMutation,
	GetUserGroupByIdDocument,
	GetUserGroupByIdQuery,
	GetUserGroupByIdQueryVariables,
	GetUserGroupsWithFiltersDocument,
	GetUserGroupsWithFiltersQuery,
	GetUserGroupsWithFiltersQueryVariables,
	InsertUserGroupDocument,
	InsertUserGroupMutation,
	LinkPermissionGroupToUserGroupDocument,
	LinkPermissionGroupToUserGroupMutation,
	UnlinkPermissionGroupFromUserGroupDocument,
	UnlinkPermissionGroupFromUserGroupMutation,
	UpdateUserGroupDocument,
	UpdateUserGroupMutation,
} from '../../shared/generated/graphql-db-types';
import { CustomError } from '../../shared/helpers';
import { ApolloCacheManager, dataService } from '../../shared/services';
import { Permission, PermissionGroup } from '../permission-groups/permission-group.types';

import { ITEMS_PER_PAGE } from './user-group.const';
import { UserGroup, UserGroupDb } from './user-group.types';

export class UserGroupService {
	public static async fetchUserGroups(
		page: number,
		sortColumn: string,
		sortOrder: Avo.Search.OrderDirection,
		where: GetUserGroupsWithFiltersQueryVariables['where']
	): Promise<[UserGroup[], number]> {
		let variables: GetUserGroupsWithFiltersQueryVariables | null = null;
		try {
			variables = {
				where,
				offset: ITEMS_PER_PAGE * page,
				limit: ITEMS_PER_PAGE,
				orderBy: [{ [sortColumn]: sortOrder }],
			};
			const response = await dataService.query<GetUserGroupsWithFiltersQuery>({
				variables,
				query: GetUserGroupsWithFiltersDocument,
			});
			const userGroups = response.users_groups;
			const userGroupCount = response.users_groups_aggregate.aggregate?.count ?? 0;

			if (!userGroups) {
				throw new CustomError(
					'Response from database does not contain any user groups',
					null,
					{ response }
				);
			}

			return [userGroups as UserGroup[], userGroupCount];
		} catch (err) {
			throw new CustomError('Failed to fetch user groups from graphql', err, {
				variables,
				query: 'GET_USER_GROUPS_WITH_FILTERS',
			});
		}
	}

	public static async fetchAllUserGroups(): Promise<UserGroup[]> {
		const response = await UserGroupService.fetchUserGroups(0, 'label', 'asc', {});
		return response[0];
	}

	public static async fetchUserGroupById(id: number): Promise<UserGroupDb> {
		let variables: GetUserGroupByIdQueryVariables | null = null;
		try {
			variables = {
				id,
			};
			const response = await dataService.query<GetUserGroupByIdQuery>({
				variables,
				query: GetUserGroupByIdDocument,
			});

			return response.users_groups[0];
		} catch (err) {
			throw new CustomError('Failed to fetch user group by id from graphql', err, {
				variables,
				query: 'GET_USER_GROUP_BY_ID',
			});
		}
	}

	public static async addPermissionGroupsToUserGroup(
		permissionGroupIds: number[],
		userGroupId: number | string
	): Promise<void> {
		try {
			await dataService.query<LinkPermissionGroupToUserGroupMutation>({
				query: LinkPermissionGroupToUserGroupDocument,
				variables: {
					objs: permissionGroupIds.map((permissionGroupId) => ({
						user_permission_group_id: permissionGroupId,
						user_group_id: userGroupId,
					})),
				},
				update: ApolloCacheManager.clearUserGroupCache,
			});
		} catch (err) {
			throw new CustomError('Failed to add permission groups to user group', err, {
				query: 'ADD_PERMISSION_GROUPS_TO_USER_GROUP',
				variables: {
					permissionGroupIds,
					userGroupId,
				},
			});
		}
	}

	public static async removePermissionGroupsFromUserGroup(
		permissionGroupIds: number[],
		userGroupId: number | string
	): Promise<void> {
		try {
			await dataService.query<UnlinkPermissionGroupFromUserGroupMutation>({
				query: UnlinkPermissionGroupFromUserGroupDocument,
				variables: {
					permissionGroupIds,
					userGroupId,
				},
				update: ApolloCacheManager.clearUserGroupCache,
			});
		} catch (err) {
			throw new CustomError('Failed to remove permission groups from user group', err, {
				query: 'REMOVE_PERMISSION_GROUPS_FROM_USER_GROUP',
				variables: {
					permissionGroupIds,
					userGroupId,
				},
			});
		}
	}

	public static async insertUserGroup(userGroup: UserGroup): Promise<number> {
		try {
			const response = await dataService.query<InsertUserGroupMutation>({
				query: InsertUserGroupDocument,
				variables: {
					userGroup: {
						label: userGroup.label,
						description: userGroup.description,
					} as Partial<UserGroup>,
				},
				update: ApolloCacheManager.clearUserGroupCache,
			});
			const userGroupId = response.insert_users_groups?.returning?.[0]?.id;
			if (isNil(userGroupId)) {
				throw new CustomError(
					'Response from database does not contain the id of the inserted user group',
					null,
					{ response }
				);
			}
			return userGroupId;
		} catch (err) {
			throw new CustomError('Failed to insert user group in the database', err, {
				userGroup,
				query: 'INSERT_USER_GROUP',
			});
		}
	}

	static async updateUserGroup(userGroup: UserGroup): Promise<void> {
		try {
			await dataService.query<UpdateUserGroupMutation>({
				query: UpdateUserGroupDocument,
				variables: {
					userGroup: {
						label: userGroup.label,
						description: userGroup.description,
					} as Partial<UserGroup>,
					userGroupId: userGroup.id,
				},
				update: ApolloCacheManager.clearUserGroupCache,
			});
		} catch (err) {
			throw new CustomError('Failed to update user group in the database', err, {
				userGroup,
				query: 'UPDATE_USER_GROUP',
			});
		}
	}

	public static async deleteUserGroup(userGroupId: number): Promise<void> {
		try {
			await dataService.query<DeleteUserGroupMutation>({
				query: DeleteUserGroupDocument,
				variables: {
					userGroupId,
				},
				update: ApolloCacheManager.clearUserGroupCache,
			});
		} catch (err) {
			throw new CustomError('Failed to delete user group from the database', err, {
				userGroupId,
				query: 'DELETE_USER_GROUP',
			});
		}
	}

	public static sortPermissionGroups(
		permissionGroups: PermissionGroup[],
		sortColumn: string,
		sortOrder: Avo.Search.OrderDirection
	): PermissionGroup[] {
		return uniqBy(
			orderBy(permissionGroups, [sortColumn], [sortOrder]),
			(permissionGroup) => permissionGroup.id
		);
	}

	public static getPermissions(permissionGroup: any): Permission[] {
		return get(permissionGroup, 'permission_group_user_permissions', []).map(
			(permissionLink: any) => {
				return get(permissionLink, 'permission');
			}
		);
	}
}

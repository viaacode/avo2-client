import { get, isNil, orderBy } from 'lodash-es';

import { CustomError } from '../../shared/helpers';
import { SortOrder } from '../../shared/hooks';
import { dataService } from '../../shared/services';

import {
	ADD_PERMISSIONS_TO_GROUP,
	INSERT_PERMISSIONS_GROUP,
	REMOVE_PERMISSIONS_FROM_GROUP,
	UPDATE_PERMISSIONS_GROUP,
} from './permission-group.gql';
import { Permission, PermissionGroup } from './permission-group.types';

export class PermissionGroupService {
	public static async addPermissionsToGroup(
		permissionIds: number[],
		permissionGroupId: number | string
	): Promise<void> {
		try {
			const response = await dataService.mutate({
				mutation: ADD_PERMISSIONS_TO_GROUP,
				variables: {
					objs: permissionIds.map(permissionId => ({
						user_permission_id: permissionId,
						user_permission_group_id: permissionGroupId,
					})),
				},
			});
			if (response.errors) {
				throw new CustomError('Failed to add permission to group', null, {
					errors: response.errors,
				});
			}
		} catch (err) {
			throw new CustomError('Failed to add  permissions to group', err, {
				query: 'ADD_PERMISSIONS_TO_GROUP',
				variables: {
					permissionIds,
					permissionGroupId,
				},
			});
		}
	}

	public static async removePermissionsToGroup(
		permissionIds: number[],
		permissionGroupId: number | string
	): Promise<void> {
		try {
			const response = await dataService.mutate({
				mutation: REMOVE_PERMISSIONS_FROM_GROUP,
				variables: {
					permissionIds,
					permissionGroupId,
				},
			});
			if (response.errors) {
				throw new CustomError('Failed to remove permissions from group', null, {
					errors: response.errors,
				});
			}
		} catch (err) {
			throw new CustomError('Failed to remove permissions from group', err, {
				query: 'REMOVE_PERMISSIONS_FROM_GROUP',
				variables: {
					permissionIds,
					permissionGroupId,
				},
			});
		}
	}

	public static async insertPermissionGroup(permissionGroup: PermissionGroup): Promise<number> {
		try {
			const response = await dataService.mutate({
				mutation: INSERT_PERMISSIONS_GROUP,
				variables: {
					permissionGroup: {
						label: permissionGroup.label,
						description: permissionGroup.description,
					} as Partial<PermissionGroup>,
				},
			});
			if (response.errors) {
				throw new CustomError('Failed to insert permission group in the database', null, {
					errors: response.errors,
					response,
				});
			}
			const permissionGroupId = get(
				response,
				'data.insert_users_permission_groups.returning.id'
			);
			if (isNil(permissionGroupId)) {
				throw new CustomError(
					'Response from database does not contain the id of the inserted permission group',
					null,
					{ response }
				);
			}
			return permissionGroupId;
		} catch (err) {
			throw new CustomError('Failed to insert permission group in the database', err, {
				permissionGroup,
				query: 'INSERT_PERMISSIONS_GROUP',
			});
		}
	}

	static async updatePermissionGroup(permissionGroup: PermissionGroup) {
		try {
			const response = await dataService.mutate({
				mutation: UPDATE_PERMISSIONS_GROUP,
				variables: {
					permissionGroup: {
						label: permissionGroup.label,
						description: permissionGroup.description,
					} as Partial<PermissionGroup>,
					permissionGroupId: permissionGroup.id,
				},
			});
			if (response.errors) {
				throw new CustomError('Failed to update permission group in the database', null, {
					errors: response.errors,
					response,
				});
			}
		} catch (err) {
			throw new CustomError('Failed to update permission group in the database', err, {
				permissionGroup,
				query: 'UPDATE_PERMISSIONS_GROUP',
			});
		}
	}

	static sortPermissions(
		permissions: Permission[],
		sortColumn: string,
		sortOrder: SortOrder
	): Permission[] {
		return orderBy(permissions, [sortColumn], [sortOrder]);
	}
}

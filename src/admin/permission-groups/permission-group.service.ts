import { Avo } from '@viaa/avo2-types';
import { flatten, get, isNil, orderBy } from 'lodash-es';

import {
	DeletePermissionGroupByIdDocument,
	DeletePermissionGroupByIdMutation,
	GetAllPermissionGroupsDocument,
	GetAllPermissionGroupsQuery,
	GetAllPermissionsDocument,
	GetAllPermissionsQuery,
	GetPermissionGroupByIdDocument,
	GetPermissionGroupByIdQuery,
	GetPermissionGroupsDocument,
	GetPermissionGroupsQuery,
	GetPermissionGroupsQueryVariables,
	InsertPermissionGroupDocument,
	InsertPermissionGroupMutation,
	InsertPermissionsInPermissionGroupDocument,
	InsertPermissionsInPermissionGroupMutation,
	RemovePermissionsFromPermissionGroupDocument,
	RemovePermissionsFromPermissionGroupMutation,
	UpdatePermissionGroupDocument,
	UpdatePermissionGroupMutation,
} from '../../shared/generated/graphql-db-types';
import { CustomError } from '../../shared/helpers';
import { ApolloCacheManager, dataService, ToastService } from '../../shared/services';
import i18n from '../../shared/translations/i18n';

import { ITEMS_PER_PAGE } from './permission-group.const';
import {
	Permission,
	PermissionGroup,
	PermissionGroupOverviewTableCols,
} from './permission-group.types';

export class PermissionGroupService {
	public static async fetchPermissionGroups(
		page: number,
		sortColumn: PermissionGroupOverviewTableCols,
		sortOrder: Avo.Search.OrderDirection,
		where: GetPermissionGroupsQueryVariables['where']
	): Promise<[PermissionGroup[], number]> {
		let variables: GetPermissionGroupsQueryVariables | null = null;
		try {
			variables = {
				where,
				offset: ITEMS_PER_PAGE * page,
				limit: ITEMS_PER_PAGE,
				orderBy: [{ [sortColumn]: sortOrder }],
			};
			const response = await dataService.query<GetPermissionGroupsQuery>({
				variables,
				query: GetPermissionGroupsDocument,
			});
			const permissionGroups = response.users_permission_groups;
			const permissionGroupCount =
				response.users_permission_groups_aggregate.aggregate?.count || 0;

			if (!permissionGroups) {
				throw new CustomError('Response does not contain any permission groups', null, {
					response,
				});
			}

			return [permissionGroups, permissionGroupCount];
		} catch (err) {
			throw new CustomError('Failed to get permission groups from the database', err, {
				variables,
				query: 'GET_PERMISSION_GROUPS',
			});
		}
	}

	public static async fetchAllPermissionGroups(): Promise<PermissionGroup[]> {
		try {
			const response = await dataService.query<GetAllPermissionGroupsQuery>({
				query: GetAllPermissionGroupsDocument,
			});
			const permissionGroups: PermissionGroup[] | undefined =
				response.users_permission_groups;

			if (!permissionGroups) {
				throw new CustomError('Response does not contain permissionGroups', null, {
					response,
				});
			}

			return permissionGroups;
		} catch (err) {
			throw new CustomError('Failed to get all permissionGroups from database', err, {
				query: 'GET_ALL_PERMISSION_GROUPS',
			});
		}
	}

	public static async fetchPermissionGroup(id: string): Promise<PermissionGroup> {
		try {
			const response = await dataService.query<GetPermissionGroupByIdQuery>({
				query: GetPermissionGroupByIdDocument,
				variables: { id },
			});

			const permissionGroupObj = response.users_permission_groups[0];

			if (!permissionGroupObj) {
				throw new CustomError('Failed to find permission group by id', null, { response });
			}

			const permissions: Permission[] = flatten(
				get(permissionGroupObj, 'permission_group_user_permissions', []).map(
					(permissionGroupItem: any) => {
						return get(permissionGroupItem, 'permissions', []);
					}
				)
			);

			return {
				permissions,
				id: permissionGroupObj.id,
				label: permissionGroupObj.label,
				description: permissionGroupObj.description,
				created_at: permissionGroupObj.created_at,
				updated_at: permissionGroupObj.updated_at,
			};
		} catch (err) {
			throw new CustomError('Failed to get permission group by id', err, {
				query: 'GET_PERMISSION_GROUP_BY_ID',
				variables: { id },
			});
		}
	}

	public static async addPermissionsToGroup(
		permissionIds: number[],
		permissionGroupId: number | string
	): Promise<void> {
		try {
			await dataService.query<InsertPermissionsInPermissionGroupMutation>({
				query: InsertPermissionsInPermissionGroupDocument,
				variables: {
					objs: permissionIds.map((permissionId) => ({
						user_permission_id: permissionId,
						user_permission_group_id: permissionGroupId,
					})),
				},
				update: ApolloCacheManager.clearPermissionCache,
			});
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

	public static async removePermissionsFromPermissionGroup(
		permissionIds: number[],
		permissionGroupId: number | string
	): Promise<void> {
		try {
			await dataService.query<RemovePermissionsFromPermissionGroupMutation>({
				query: RemovePermissionsFromPermissionGroupDocument,
				variables: {
					permissionIds,
					permissionGroupId,
				},
				update: ApolloCacheManager.clearPermissionCache,
			});
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
			const response = await dataService.query<InsertPermissionGroupMutation>({
				query: InsertPermissionGroupDocument,
				variables: {
					permissionGroup: {
						label: permissionGroup.label,
						description: permissionGroup.description,
					} as Partial<PermissionGroup>,
				},
				update: ApolloCacheManager.clearPermissionCache,
			});
			const permissionGroupId = response.insert_users_permission_groups?.returning?.[0]?.id;
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

	static async updatePermissionGroup(permissionGroup: PermissionGroup): Promise<void> {
		try {
			await dataService.query<UpdatePermissionGroupMutation>({
				query: UpdatePermissionGroupDocument,
				variables: {
					permissionGroup: {
						label: permissionGroup.label,
						description: permissionGroup.description,
					} as Partial<PermissionGroup>,
					permissionGroupId: permissionGroup.id,
				},
				update: ApolloCacheManager.clearPermissionCache,
			});
		} catch (err) {
			throw new CustomError('Failed to update permission group in the database', err, {
				permissionGroup,
				query: 'UPDATE_PERMISSIONS_GROUP',
			});
		}
	}

	public static async deletePermissionGroup(
		permissionGroupId: number | null | undefined
	): Promise<void> {
		try {
			if (isNil(permissionGroupId)) {
				throw new CustomError(
					'Failed to delete permission group since the id is nil',
					null,
					{
						permissionGroupId,
					}
				);
			}
			await dataService.query<DeletePermissionGroupByIdMutation>({
				query: DeletePermissionGroupByIdDocument,
				variables: {
					id: permissionGroupId,
				},
				update: ApolloCacheManager.clearPermissionCache,
			});
		} catch (err) {
			console.error(
				new CustomError('Failed to delete permission group from the database', err, {
					permissionGroupId,
					query: 'DELETE_PERMISSION_GROUP',
				})
			);
			ToastService.danger(
				i18n.t(
					'admin/permission-groups/permission-group___het-verwijderen-van-de-permissie-groep-is-mislukt'
				)
			);
		}
	}

	public static async fetchAllPermissions(): Promise<Permission[]> {
		try {
			const response = await dataService.query<GetAllPermissionsQuery>({
				query: GetAllPermissionsDocument,
			});

			const permissions = response.users_permissions;

			if (!permissions) {
				throw new CustomError('Response does not contain permissions', null, { response });
			}

			return permissions;
		} catch (err) {
			throw new CustomError('Failed to get all permissions from database', err, {
				query: 'GET_ALL_PERMISSIONS',
			});
		}
	}

	static sortPermissions(
		permissions: Permission[],
		sortColumn: string,
		sortOrder: Avo.Search.OrderDirection
	): Permission[] {
		return orderBy(permissions, [sortColumn], [sortOrder]);
	}
}

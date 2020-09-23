import { mapLimit } from 'blend-promise-utils';
import {
	compact,
	flatten,
	forEach,
	fromPairs,
	isEqual,
	isFunction,
	isString,
	map,
	snakeCase,
	uniq,
	uniqWith,
	values,
} from 'lodash';
import fetch from 'node-fetch';
import path from 'path';

import { ROW_PERMISSIONS, RowPermission, TableOperation } from './row-permissions';

const fs = require('fs-extra');

interface UsersGroup {
	label: string;
	group_user_permission_groups: GroupUserPermissionGroup[];
}

interface GroupUserPermissionGroup {
	permission_group: PermissionGroup;
}

interface PermissionGroup {
	permission_group_user_permissions: PermissionGroupUserPermission[];
}

interface PermissionGroupUserPermission {
	permission: Permission;
}

interface Permission {
	label: string;
}

type SegmentedTablePermissions = {
	[userGroup: string]: {
		[tableName: string]: {
			[operationName in Partial<TableOperation>]: ResolvedRowPermission[];
		};
	};
};

interface ResolvedRowPermission extends RowPermission {
	columns: string[];
}

interface FinalRowPermission extends ResolvedRowPermission {
	userGroup: string;
}

/**
 * We can only add one permission per table per operation per role
 * So we need to merge multiple permissions into one
 * We can do this if
 *    - the rowPermissions are identical
 *    - one rowPermission has no checks and the other does for the same array of columns
 *    - row permissions have the same checks for different column arrays, we can just union the columns then
 * @param segmentedTablePermissions
 * @return list of permissions
 */
function mergePermissions(
	segmentedTablePermissions: SegmentedTablePermissions
): FinalRowPermission[] {
	const resolvedRowPermissions: FinalRowPermission[] = [];

	forEach(segmentedTablePermissions, (userGroupPermissions, userGroup: string) => {
		forEach(userGroupPermissions, tablePermissions => {
			forEach(tablePermissions, operationPermissions => {
				if (operationPermissions.length > 1) {
					// Merge permissions using simplified algorithm.
					// This is far from ideal, but should be better than no permission checks at all
					// If we try to merge the permissions in an intelligent way, we run against the limitation of the graphql engine:
					// https://github.com/hasura/graphql-engine/issues/3442
					resolvedRowPermissions.push({
						...operationPermissions[0],
						userGroup,
						columns: uniq(
							flatten(operationPermissions.map(permission => permission.columns))
						).sort(),
						check_columns: uniqWith(
							operationPermissions.map(permission => permission.check_columns),
							isEqual
						),
					});
				}
			});
		});
	});

	return resolvedRowPermissions;
}

/**
 * Removes all existing permissions in the hasura database and
 * inserts the new permissions based on the ROW_PERMISSIONS array
 */
async function updateRowPermissions(createOrDrop: 'create' | 'drop') {
	// Convert list of permissions by permissionName to list of permissions by table and operation
	const segmentedTablePermissions: SegmentedTablePermissions = {};

	// Get permission list per role
	const permissionsPerUserGroup = await getPermissionsPerUserGroup();

	// Get columns for each table in the ROW_PERMISSIONS
	const tables = flatten(compact(values(ROW_PERMISSIONS))).map(permission => permission.table);
	const columnsPerTable: { [tableName: string]: string[] } = await getColumnNames(tables);

	// Link permission info to each permission
	forEach(permissionsPerUserGroup, (permissionNames: PermissionName[], userGroup: string) => {
		// Init user group key if it doesn't exist yet
		if (!segmentedTablePermissions[userGroup]) {
			segmentedTablePermissions[userGroup] = {} as {
				[tableName: string]: {
					[operationName in Partial<TableOperation>]: ResolvedRowPermission[];
				};
			};
		}
		permissionNames.forEach(permissionName => {
			const rowPermissions = (ROW_PERMISSIONS as any)[permissionName] as
				| RowPermission[]
				| null;
			if (!rowPermissions) {
				return;
			}
			rowPermissions.forEach(rowPermission => {
				// Init table key if it doesn't exist yet
				if (!segmentedTablePermissions[userGroup][rowPermission.table]) {
					segmentedTablePermissions[userGroup][rowPermission.table] = {} as {
						[operationName in Partial<TableOperation>]: ResolvedRowPermission[];
					};
				}
				const operations: TableOperation[] = isString(rowPermission.operation)
					? [rowPermission.operation]
					: rowPermission.operation;

				operations.forEach(operation => {
					// Init operation name if it doesn't exist yet
					if (!segmentedTablePermissions[userGroup][rowPermission.table][operation]) {
						segmentedTablePermissions[userGroup][rowPermission.table][
							operation
						] = [] as ResolvedRowPermission[];
					}

					// Resolve columns to array of strings
					let columns: string[];
					if (isFunction(rowPermission.columns)) {
						columns = rowPermission.columns(columnsPerTable[rowPermission.table]);
					} else if (!rowPermission.columns) {
						columns = columnsPerTable[rowPermission.table];
					} else {
						columns = rowPermission.columns;
					}

					segmentedTablePermissions[userGroup][rowPermission.table][operation].push({
						...rowPermission,
						operation,
						columns,
					});
				});
			});
		});
	});

	const finalPermissions: FinalRowPermission[] = mergePermissions(segmentedTablePermissions);

	await mapLimit(finalPermissions, 20, permission =>
		setPermissionInDatabase(permission, createOrDrop)
	);

	const outputFile = path.join(__dirname, 'permissions.json');
	await fs.writeFile(outputFile, JSON.stringify(finalPermissions, null, 2));

	console.log(`updating permissions: ... done. Full permission list: ${outputFile}`);
}

async function setPermissionInDatabase(
	permission: FinalRowPermission,
	createOrDrop: 'create' | 'drop'
): Promise<void> {
	try {
		if (!process.env.GRAPHQL_URL) {
			throw new Error('Env variable GRAPHQL_URL must be set');
		}
		if (!process.env.GRAPHQL_SECRET) {
			throw new Error('Env variable GRAPHQL_SECRET must be set');
		}

		let check: any;
		if (!permission.check_columns || permission.check_columns.length === 0) {
			check = undefined;
		} else if (permission.check_columns.length === 1) {
			check = permission.check_columns[0];
		} else {
			check = {
				_or: permission.check_columns,
			};
		}

		// Make call to database to set the permission
		await fetch(process.env.GRAPHQL_URL.replace('/v1/graphql', '/v1/query'), {
			method: 'POST',
			body: JSON.stringify({
				type: `${createOrDrop}_${permission.operation}_permission`,
				args: {
					table: permission.table,
					role: snakeCase(permission.userGroup),
					permission: {
						check,
						columns: permission.columns,
					},
				},
			}),
			headers: {
				'x-hasura-admin-secret': process.env.GRAPHQL_SECRET,
			},
		});
	} catch (err) {
		throw new Error(
			`Failed to get permissions per user group from the database: ${JSON.stringify(err)}`
		);
	}
}

async function getPermissionsPerUserGroup(): Promise<{ [userGroup: string]: PermissionName[] }> {
	try {
		if (!process.env.GRAPHQL_URL) {
			throw new Error('Env variable GRAPHQL_URL must be set');
		}
		if (!process.env.GRAPHQL_SECRET) {
			throw new Error('Env variable GRAPHQL_SECRET must be set');
		}

		// Fetch user groups with their permissions from graphql database
		const response = await fetch(process.env.GRAPHQL_URL, {
			method: 'POST',
			body: JSON.stringify({
				query: `query getPermissionsPerUserGroup {
  users_groups {
    label
    group_user_permission_groups {
      permission_group {
        permission_group_user_permissions {
          permission {
            label
          }
        }
      }
    }
  }
}
`,
			}),
			headers: {
				'x-hasura-admin-secret': process.env.GRAPHQL_SECRET,
			},
		});

		// Convert database response to simple dictionary lookup
		const jsonResponse = await response.json();
		const userGroups: UsersGroup[] = jsonResponse.data.users_groups;
		return fromPairs(
			userGroups.map((userGroup): [string, PermissionName[]] => [
				userGroup.label,
				flatten(
					userGroup.group_user_permission_groups.map((userGroup): PermissionName[] =>
						userGroup.permission_group.permission_group_user_permissions.map(
							(permissions): PermissionName =>
								permissions.permission.label as PermissionName
						)
					)
				),
			])
		);
	} catch (err) {
		throw new Error(
			`Failed to get permissions per user group from the database: ${JSON.stringify(err)}`
		);
	}
}

/**
 * Get column names for the columns in the specified database tables
 * @param tableNames list of table names to get the columns for
 * @return key value pair, where the key is the table name and the value is the list of column names
 */
async function getColumnNames(tableNames: string[]): Promise<{ [tableName: string]: string[] }> {
	try {
		if (!process.env.GRAPHQL_URL) {
			throw new Error('Env variable GRAPHQL_URL must be set');
		}
		if (!process.env.GRAPHQL_SECRET) {
			throw new Error('Env variable GRAPHQL_SECRET must be set');
		}

		// Get all columns for all tables with one query
		const uniqueTableNames = uniq(tableNames);
		const queryBody = uniqueTableNames
			.map(tableName => `${tableName}: __type(name: "${tableName}") { fields { name } }`)
			.join('\n');
		const response = await fetch(process.env.GRAPHQL_URL, {
			method: 'POST',
			body: JSON.stringify({
				query: `query getColumns{${queryBody}}`,
			}),
			headers: {
				'x-hasura-admin-secret': process.env.GRAPHQL_SECRET,
			},
		});

		// Convert database response to simple dictionary lookup
		const jsonResponse = await response.json();
		return fromPairs(
			map(jsonResponse.data, (value, tableName): [string, string[]] => {
				return [
					tableName,
					value.fields.map((field: { name: string }): string => field.name),
				];
			})
		);
	} catch (err) {
		throw new Error(
			`Failed to get column names for table from the database: ${JSON.stringify(err)}`
		);
	}
}

console.log('updating permissions: ...');
updateRowPermissions('create').catch(err => {
	console.log(`updating permissions: ... Failed: ${JSON.stringify(err)}`);
});

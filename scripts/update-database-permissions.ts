// tslint:disable:no-console

import { mapLimit } from 'blend-promise-utils';
import {
	compact,
	flatten,
	forEach,
	fromPairs,
	get,
	isEqual,
	isFunction,
	isString,
	map,
	snakeCase,
	sortBy,
	uniq,
	uniqWith,
	values,
} from 'lodash';
import fetch from 'node-fetch';
import path from 'path';

import { CustomError } from '../src/shared/helpers/custom-error';

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

const GRAPHQL_SIMPLE_TYPES = [
	'Boolean',
	'Float',
	'ID',
	'Int',
	'String',
	'bigint',
	'bpchar',
	'date',
	'jsonb',
	'time',
	'timestamp',
	'timestamptz',
	'uuid',
];

const LIMIT_ROWS = 100;

function getFullTableName(table: { name: string; schema: string }): string {
	return `${table.schema}_${table.name}`;
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
							compact(
								operationPermissions.map(permission => permission.check_columns)
							),
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
	const columnsPerTable: { [tableName: string]: string[] } = await getColumnNames(
		tables.map(getFullTableName)
	);

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
				const fullTableName = getFullTableName(rowPermission.table);
				if (!segmentedTablePermissions[userGroup][fullTableName]) {
					segmentedTablePermissions[userGroup][fullTableName] = {} as {
						[operationName in Partial<TableOperation>]: ResolvedRowPermission[];
					};
				}
				const operations: TableOperation[] = isString(rowPermission.operation)
					? [rowPermission.operation]
					: rowPermission.operation;

				operations.forEach(operation => {
					// Init operation name if it doesn't exist yet
					if (!segmentedTablePermissions[userGroup][fullTableName][operation]) {
						segmentedTablePermissions[userGroup][fullTableName][
							operation
						] = [] as ResolvedRowPermission[];
					}

					// Resolve columns to array of strings
					let columns: string[];
					if (isFunction(rowPermission.columns)) {
						columns = rowPermission.columns(columnsPerTable[fullTableName]);
					} else if (!rowPermission.columns) {
						columns = columnsPerTable[fullTableName];
					} else {
						columns = rowPermission.columns;
					}

					segmentedTablePermissions[userGroup][fullTableName][operation].push({
						...rowPermission,
						operation,
						columns,
					});
				});
			});
		});
	});

	const finalPermissions: FinalRowPermission[] = sortBy(
		mergePermissions(segmentedTablePermissions),
		[permission => getFullTableName(permission.table), permission => permission.operation]
	);

	const insertedPermissions = await mapLimit(finalPermissions, 1, permission =>
		setPermissionInDatabase(permission, createOrDrop)
	);

	const outputFile = path.join(__dirname, 'permissions.json');
	await fs.writeFile(outputFile, JSON.stringify(insertedPermissions, null, 2));

	console.log(`updating permissions: ... done. Full permission list: ${outputFile}`);
}

async function setPermissionInDatabase(
	permission: FinalRowPermission,
	createOrDrop: 'create' | 'drop'
): Promise<any> {
	try {
		if (!process.env.GRAPHQL_URL) {
			throw new CustomError('Env variable GRAPHQL_URL must be set');
		}
		if (!process.env.GRAPHQL_SECRET) {
			throw new CustomError('Env variable GRAPHQL_SECRET must be set');
		}

		let check: any;
		if (!permission.check_columns || permission.check_columns.length === 0) {
			check = {};
		} else if (permission.check_columns.length === 1) {
			check = permission.check_columns[0];
		} else {
			check = {
				$or: permission.check_columns,
			};
		}

		// Make call to database to set the permission
		let permissionBody;
		switch (permission.operation) {
			case 'insert':
				permissionBody = {
					check,
					columns: permission.columns,
				};
				break;

			case 'select':
				permissionBody = {
					filter: check,
					columns: permission.columns,
					limit: LIMIT_ROWS,
					allow_aggregations: true,
				};
				break;

			case 'update':
				permissionBody = {
					filter: check,
					columns: permission.columns,
				};
				break;

			case 'delete':
			default:
				permissionBody = {
					filter: check,
				};
				break;
		}
		const body = {
			type: `${createOrDrop}_${permission.operation}_permission`,
			args: {
				table: permission.table,
				role: snakeCase(permission.userGroup),
				...(createOrDrop === 'create'
					? {
							permission: permissionBody,
					  }
					: {}),
			},
		};
		const response = await fetch(process.env.GRAPHQL_URL.replace('/v1/graphql', '/v1/query'), {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'x-hasura-admin-secret': process.env.GRAPHQL_SECRET,
			},
		});

		try {
			const responseJson = await response.json();

			console.log(
				`[PERMISSIONS] ${permission.operation} ${getFullTableName(permission.table)}`,
				responseJson
			);

			if (responseJson.error) {
				throw new CustomError(
					'permission modification responded with an error',
					null,
					responseJson
				);
			}
		} catch (err) {
			try {
				const text = await response.text();
				throw new CustomError('Response from graphql is text instead of json', err, {
					text,
					response,
				});
			} catch (err) {
				throw new CustomError('Response from graphql cannot be interpreted', err, {
					response,
				});
			}
		}

		return body;
	} catch (err) {
		throw new CustomError('Failed to get permissions per user group from the database', err);
	}
}

async function getPermissionsPerUserGroup(): Promise<{ [userGroup: string]: PermissionName[] }> {
	try {
		if (!process.env.GRAPHQL_URL) {
			throw new CustomError('Env variable GRAPHQL_URL must be set');
		}
		if (!process.env.GRAPHQL_SECRET) {
			throw new CustomError('Env variable GRAPHQL_SECRET must be set');
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
		if (jsonResponse.errors) {
			throw new CustomError('graphQL response contains errors', jsonResponse);
		}
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
		throw new CustomError('Failed to get permissions per user group from the database', err);
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
			throw new CustomError('Env variable GRAPHQL_URL must be set');
		}
		if (!process.env.GRAPHQL_SECRET) {
			throw new CustomError('Env variable GRAPHQL_SECRET must be set');
		}

		// Get all columns for all tables with one query
		const uniqueTableNames = uniq(tableNames);
		const queryBody = uniqueTableNames
			.map(
				tableName =>
					`${tableName}: __type(name: "${tableName}") { fields { name, type { name, ofType { name } } } }`
			)
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
					compact(
						value.fields.map((field: { name: string; type: { name: string } }):
							| string
							| null => {
							if (GRAPHQL_SIMPLE_TYPES.includes(get(field, 'type.name'))) {
								return field.name;
							}
							if (GRAPHQL_SIMPLE_TYPES.includes(get(field, 'type.ofType.name'))) {
								return field.name;
							}
							return null;
						})
					),
				];
			})
		);
	} catch (err) {
		throw new CustomError('Failed to get column names for table from the database', err);
	}
}

console.log('updating permissions: ...');
updateRowPermissions('create').catch(err => {
	console.log(`updating permissions: ... Failed: ${JSON.stringify(err)}`);
});
// tslint:enable:no-console

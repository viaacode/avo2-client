import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { getProfileId } from './get-profile-info';

type PermissionInfo = { name: PermissionName; obj?: any | null };

export type Permissions = PermissionName | PermissionInfo | (PermissionName | PermissionInfo)[];

export enum PERMISSIONS {
	ADD_HYPERLINK_COLLECTIONS = 'ADD_HYPERLINK_COLLECTIONS',
	CREATE_ACCOUNT = 'CREATE_ACCOUNT',
	CREATE_ASSIGNMENT_RESPONSE = 'CREATE_ASSIGNMENT_RESPONSE',
	CREATE_ASSIGNMENTS = 'CREATE_ASSIGNMENTS',
	CREATE_BUNDLES = 'CREATE_BUNDLES',
	CREATE_COLLECTIONS = 'CREATE_COLLECTIONS',
	CREATE_CONTENT_PAGES = 'CREATE_CONTENT_PAGES',
	DELETE_ANY_ACCOUNTS = 'DELETE_ANY_ACCOUNTS',
	DELETE_ANY_BUNDLES = 'DELETE_ANY_BUNDLES',
	DELETE_ANY_COLLECTIONS = 'DELETE_ANY_COLLECTIONS',
	DELETE_ANY_CONTENT_PAGES = 'DELETE_ANY_CONTENT_PAGES',
	DELETE_ASSIGNMENTS = 'DELETE_ASSIGNMENTS',
	DELETE_OWN_BUNDLES = 'DELETE_OWN_BUNDLES',
	DELETE_OWN_COLLECTIONS = 'DELETE_OWN_COLLECTIONS',
	DELETE_OWN_CONTENT_PAGES = 'DELETE_OWN_CONTENT_PAGES',
	EDIT_ANY_ACCOUNTS = 'EDIT_ANY_ACCOUNTS',
	EDIT_ANY_BUNDLES = 'EDIT_ANY_BUNDLES',
	EDIT_ANY_COLLECTIONS = 'EDIT_ANY_COLLECTIONS',
	EDIT_ANY_CONTENT_PAGES = 'EDIT_ANY_CONTENT_PAGES',
	EDIT_ASSIGNMENTS = 'EDIT_ASSIGNMENTS',
	EDIT_OWN_BUNDLES = 'EDIT_OWN_BUNDLES',
	EDIT_OWN_COLLECTIONS = 'EDIT_OWN_COLLECTIONS',
	EDIT_OWN_CONTENT_PAGES = 'EDIT_OWN_CONTENT_PAGES',
	EDIT_SITE_SETTINGS = 'EDIT_SITE_SETTINGS',
	PUBLISH_ALL_BUNDLES = 'PUBLISH_ALL_BUNDLES',
	PUBLISH_ALL_COLLECTIONS = 'PUBLISH_ALL_COLLECTIONS',
	PUBLISH_BUNDLES_WITH_LABEL = 'PUBLISH_BUNDLES_WITH_LABEL',
	PUBLISH_COLLECTION_WITH_LABEL = 'PUBLISH_COLLECTION_WITH_LABEL',
	PUBLISH_OWN_BUNDLES = 'PUBLISH_OWN_BUNDLES',
	PUBLISH_OWN_COLLECTIONS = 'PUBLISH_OWN_COLLECTIONS',
	SEARCH = 'SEARCH',
	SHARE_BUNDLES_BY_LINK = 'SHARE_BUNDLES_BY_LINK',
	SHARE_COLLECTIONS_BY_LINK = 'SHARE_COLLECTIONS_BY_LINK',
	VIEW_CONTENT_FROM_ASSIGNMENT = 'VIEW_CONTENT_FROM_ASSIGNMENT',
}

export type PermissionName = keyof typeof PERMISSIONS;

export class PermissionService {
	public static hasPermissions(permissions: Permissions, user: Avo.User.User): boolean {
		// Reformat all permissions to format: PermissionInfo[]
		let permissionList: PermissionInfo[];
		if (typeof permissions === 'string') {
			// Single permission by name
			permissionList = [{ name: permissions as PermissionName }];
		} else if ((permissions as PermissionInfo).name) {
			// Single permission by name and object
			permissionList = [permissions as PermissionInfo];
		} else {
			// Permission list of strings and objects containing a permission name and an object
			permissionList = (permissions as (string | PermissionInfo)[]).map(
				(permission: string | PermissionInfo): PermissionInfo => {
					if (typeof permission === 'string') {
						// Single permission by name
						return { name: permission as PermissionName };
					}
					// Single permission by name and object
					return permission as PermissionInfo;
				}
			);
		}
		// Check every permission and return true for the first permission that returns true (lazy eval)
		for (const perm of permissionList) {
			if (this.hasPermission(perm.name, perm.obj, user)) {
				return true;
			}
		}
		return false;
	}

	private static hasPermission(
		permissionName: PermissionName,
		obj: any | null | undefined,
		user: Avo.User.User | null
	) {
		const permissions = get(user, 'profile.permissions');
		if (!user || !permissions) {
			return false;
		}
		// Check if user has the requested permission
		const profileId = getProfileId(user);
		if (!permissions.includes(permissionName)) {
			return false;
		}
		// Special checks on top of name being in the permission list
		switch (permissionName) {
			// TODO: replace example permissions
			case 'EDIT_OWN_COLLECTIONS':
				const ownerId = get(obj, 'owner_profile_id');
				return profileId && ownerId && profileId === ownerId;

			default:
				// The permission does not require any other checks besides is presence in the permission list
				return true;
		}
	}
}

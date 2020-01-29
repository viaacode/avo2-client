import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { dataService } from '../../shared/services/data-service';
import { getProfileId } from './get-profile-info';
import {
	GET_LINKED_COLLECTIONS,
	GET_LINKED_ITEMS,
	GET_LINKED_SEARCH_QUERIES,
} from './permission-service.gql';

type PermissionInfo = { name: PermissionNames; obj?: any | null };

export type Permissions = PermissionNames | PermissionInfo | (PermissionNames | PermissionInfo)[];

export enum PermissionNames {
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
	VIEW_ITEMS = 'VIEW_ITEMS',
	VIEW_COLLECTIONS = 'VIEW_COLLECTIONS',
	VIEW_BUNDLES = 'VIEW_BUNDLES',
	CREATE_BOOKMARKS = 'CREATE_BOOKMARKS',
	VIEW_ITEMS_LINKED_TO_ASSIGNMENT = 'VIEW_ITEMS_LINKED_TO_ASSIGNMENT',
	VIEW_COLLECTIONS_LINKED_TO_ASSIGNMENT = 'VIEW_COLLECTIONS_LINKED_TO_ASSIGNMENT',
	VIEW_SEARCH_QUERIES_LINKED_TO_ASSIGNMENT = 'VIEW_SEARCH_QUERIES_LINKED_TO_ASSIGNMENT',
}

export class PermissionService {
	public static async hasPermissions(
		permissions: Permissions,
		user: Avo.User.User | null
	): Promise<boolean> {
		// Reformat all permissions to format: PermissionInfo[]
		let permissionList: PermissionInfo[];
		if (typeof permissions === 'string') {
			// Single permission by name
			permissionList = [{ name: permissions as PermissionNames }];
		} else if ((permissions as PermissionInfo).name) {
			// Single permission by name and object
			permissionList = [permissions as PermissionInfo];
		} else {
			// Permission list of strings and objects containing a permission name and an object
			permissionList = (permissions as (string | PermissionInfo)[]).map(
				(permission: string | PermissionInfo): PermissionInfo => {
					if (typeof permission === 'string') {
						// Single permission by name
						return { name: permission as PermissionNames };
					}
					// Single permission by name and object
					return permission as PermissionInfo;
				}
			);
		}
		if (!permissionList.length) {
			return true; // If no required permissions are passed, then the user is allowed to see the item/page
		}
		if (!user) {
			console.warn('Checking permissions without user object', { permissionList, user });
			return false;
		}
		// Check every permission and return true for the first permission that returns true (lazy eval)
		for (const perm of permissionList) {
			if (await this.hasPermission(perm.name, perm.obj, user)) {
				return true;
			}
		}
		return false;
	}

	public static async hasPermission(
		permissionName: PermissionNames,
		obj: any | null | undefined,
		user: Avo.User.User
	): Promise<boolean> {
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
			case PermissionNames.EDIT_OWN_COLLECTIONS:
				const ownerId = get(obj, 'owner_profile_id');
				return profileId && ownerId && profileId === ownerId;

			case PermissionNames.VIEW_ITEMS_LINKED_TO_ASSIGNMENT:
				return this.checkViewItemsLinkedToAssignment(user, obj, 'ITEM');

			case PermissionNames.VIEW_COLLECTIONS_LINKED_TO_ASSIGNMENT:
				return this.checkViewItemsLinkedToAssignment(user, obj, 'COLLECTIE');

			case PermissionNames.VIEW_SEARCH_QUERIES_LINKED_TO_ASSIGNMENT:
				return this.checkViewItemsLinkedToAssignment(user, obj, 'ZOEKOPDRACHT');

			default:
				// The permission does not require any other checks besides is presence in the permission list
				return true;
		}
	}

	private static async checkViewItemsLinkedToAssignment(
		user: Avo.User.User,
		id: string,
		type: 'ITEM' | 'COLLECTIE' | 'ZOEKOPDRACHT'
	): Promise<boolean> {
		if (!user.profile) {
			return false;
		}
		const queries = {
			ITEM: GET_LINKED_ITEMS,
			COLLECTIE: GET_LINKED_COLLECTIONS,
			ZOEKOPDRACHT: GET_LINKED_SEARCH_QUERIES,
		};
		const response = await dataService.query({
			query: queries[type],
			variables:
				type === 'COLLECTIE'
					? {
							idString: id,
							idUuid: id,
							userId: user.profile.id,
					  }
					: {
							id,
							userId: user.profile.id,
					  },
		});
		return get(response, 'data.app_assignment_responses', []).length;
	}
}

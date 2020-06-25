import { get, some } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CollectionService } from '../../collection/collection.service';
import { dataService } from '../../shared/services';

import { getProfileId } from './get-profile-info';
import {
	GET_LINKED_COLLECTIONS,
	GET_LINKED_ITEMS,
	GET_LINKED_SEARCH_QUERIES,
} from './permission-service.gql';

type PermissionInfo = { name: PermissionName; obj?: any | null };

export type Permissions = PermissionName | PermissionInfo | (PermissionName | PermissionInfo)[];

export enum PermissionName {
	VIEW_OWN_SEARCH_QUERIES = 'VIEW_OWN_SEARCH_QUERIES',
	EDIT_OWN_COLLECTIONS = 'EDIT_OWN_COLLECTIONS',
	EDIT_OWN_SEARCH_QUERIES = 'EDIT_OWN_SEARCH_QUERIES',
	CREATE_COLLECTIONS = 'CREATE_COLLECTIONS',
	DELETE_OWN_SEARCH_QUERIES = 'DELETE_OWN_SEARCH_QUERIES',
	SEARCH = 'SEARCH',
	ADD_HYPERLINK_COLLECTIONS = 'ADD_HYPERLINK_COLLECTIONS',
	EDIT_OWN_BUNDLES = 'EDIT_OWN_BUNDLES',
	CREATE_BUNDLES = 'CREATE_BUNDLES',
	EDIT_PROTECTED_PAGE_STATUS = 'EDIT_PROTECTED_PAGE_STATUS',
	PUBLISH_ALL_BUNDLES = 'PUBLISH_ALL_BUNDLES',
	PUBLISH_OWN_BUNDLES = 'PUBLISH_OWN_BUNDLES',
	PUBLISH_ALL_COLLECTIONS = 'PUBLISH_ALL_COLLECTIONS',
	PUBLISH_OWN_COLLECTIONS = 'PUBLISH_OWN_COLLECTIONS',
	SHARE_COLLECTIONS_BY_LINK = 'SHARE_COLLECTIONS_BY_LINK',
	SHARE_BUNDLES_BY_LINK = 'SHARE_BUNDLES_BY_LINK',
	PUBLISH_COLLECTION_WITH_LABEL = 'PUBLISH_COLLECTION_WITH_LABEL',
	PUBLISH_BUNDLES_WITH_LABEL = 'PUBLISH_BUNDLES_WITH_LABEL',
	CREATE_ASSIGNMENTS = 'CREATE_ASSIGNMENTS',
	EDIT_ASSIGNMENTS = 'EDIT_ASSIGNMENTS',
	DELETE_ASSIGNMENTS = 'DELETE_ASSIGNMENTS',
	CREATE_ASSIGNMENT_RESPONSE = 'CREATE_ASSIGNMENT_RESPONSE',
	EDIT_NAVIGATION_BARS = 'EDIT_NAVIGATION_BARS',
	VIEW_ADMIN_DASHBOARD = 'VIEW_ADMIN_DASHBOARD',
	EDIT_ANY_COLLECTIONS = 'EDIT_ANY_COLLECTIONS',
	EDIT_ANY_BUNDLES = 'EDIT_ANY_BUNDLES',
	VIEW_USERS = 'VIEW_USERS',
	EDIT_SITE_SETTINGS = 'EDIT_SITE_SETTINGS',
	CREATE_CONTENT_PAGES = 'CREATE_CONTENT_PAGES',
	EDIT_ANY_CONTENT_PAGES = 'EDIT_ANY_CONTENT_PAGES',
	EDIT_OWN_CONTENT_PAGES = 'EDIT_OWN_CONTENT_PAGES',
	DELETE_ANY_CONTENT_PAGES = 'DELETE_ANY_CONTENT_PAGES',
	DELETE_OWN_CONTENT_PAGES = 'DELETE_OWN_CONTENT_PAGES',
	DELETE_OWN_COLLECTIONS = 'DELETE_OWN_COLLECTIONS',
	DELETE_ANY_COLLECTIONS = 'DELETE_ANY_COLLECTIONS',
	DELETE_OWN_BUNDLES = 'DELETE_OWN_BUNDLES',
	DELETE_ANY_BUNDLES = 'DELETE_ANY_BUNDLES',
	VIEW_CONTENT_FROM_ASSIGNMENT = 'VIEW_CONTENT_FROM_ASSIGNMENT',
	VIEW_ITEMS = 'VIEW_ITEMS',
	VIEW_COLLECTIONS = 'VIEW_COLLECTIONS',
	VIEW_BUNDLES = 'VIEW_BUNDLES',
	CREATE_BOOKMARKS = 'CREATE_BOOKMARKS',
	DELETE_BOOKMARKS = 'DELETE_BOOKMARKS',
	VIEW_BOOKMARKS = 'VIEW_BOOKMARKS',
	PUBLISH_ITEMS = 'PUBLISH_ITEMS',
	VIEW_ITEMS_OVERVIEW = 'VIEW_ITEMS_OVERVIEW',
	VIEW_COLLECTIONS_OVERVIEW = 'VIEW_COLLECTIONS_OVERVIEW',
	VIEW_ITEMS_LINKED_TO_ASSIGNMENT = 'VIEW_ITEMS_LINKED_TO_ASSIGNMENT',
	VIEW_COLLECTIONS_LINKED_TO_ASSIGNMENT = 'VIEW_COLLECTIONS_LINKED_TO_ASSIGNMENT',
	VIEW_SEARCH_QUERIES_LINKED_TO_ASSIGNMENT = 'VIEW_SEARCH_QUERIES_LINKED_TO_ASSIGNMENT',
	VIEW_BUNDLES_OVERVIEW = 'VIEW_BUNDLES_OVERVIEW',
	EDIT_INTERACTIVE_TOURS = 'EDIT_INTERACTIVE_TOURS',
	EDIT_TRANSLATIONS = 'EDIT_TRANSLATIONS',
	EDIT_USER_GROUPS = 'EDIT_USER_GROUPS',
	EDIT_PERMISSION_GROUPS = 'EDIT_PERMISSION_GROUPS',
	EDIT_BAN_USER_STATUS = 'EDIT_BAN_USER_STATUS',
	VIEW_EDUCATION_LEVEL_ON_PROFILE_PAGE = 'VIEW_EDUCATION_LEVEL_ON_PROFILE_PAGE',
	EDIT_EDUCATION_LEVEL_ON_PROFILE_PAGE = 'EDIT_EDUCATION_LEVEL_ON_PROFILE_PAGE',
	REQUIRED_EDUCATION_LEVEL_ON_PROFILE_PAGE = 'REQUIRED_EDUCATION_LEVEL_ON_PROFILE_PAGE',
	VIEW_EDUCATIONAL_ORGANISATION_ON_PROFILE_PAGE = 'VIEW_EDUCATIONAL_ORGANISATION_ON_PROFILE_PAGE',
	EDIT_EDUCATIONAL_ORGANISATION_ON_PROFILE_PAGE = 'EDIT_EDUCATIONAL_ORGANISATION_ON_PROFILE_PAGE',
	REQUIRED_EDUCATIONAL_ORGANISATION_ON_PROFILE_PAGE = 'REQUIRED_EDUCATIONAL_ORGANISATION_ON_PROFILE_PAGE',
	VIEW_ORGANISATION_ON_PROFILE_PAGE = 'VIEW_ORGANISATION_ON_PROFILE_PAGE',
	EDIT_ORGANISATION_ON_PROFILE_PAGE = 'EDIT_ORGANISATION_ON_PROFILE_PAGE',
	REQUIRED_ORGANISATION_ON_PROFILE_PAGE = 'REQUIRED_ORGANISATION_ON_PROFILE_PAGE',
	VIEW_SUBJECTS_ON_PROFILE_PAGE = 'VIEW_SUBJECTS_ON_PROFILE_PAGE',
	EDIT_SUBJECTS_ON_PROFILE_PAGE = 'EDIT_SUBJECTS_ON_PROFILE_PAGE',
	REQUIRED_SUBJECTS_ON_PROFILE_PAGE = 'REQUIRED_SUBJECTS_ON_PROFILE_PAGE',
	VIEW_NEWSLETTERS_PAGE = 'VIEW_NEWSLETTERS_PAGE',
	VIEW_NOTIFICATIONS_PAGE = 'VIEW_NOTIFICATIONS_PAGE',
	EDIT_COLLECTION_LABELS = 'EDIT_COLLECTION_LABELS',
	EDIT_COLLECTION_AUTHOR = 'EDIT_COLLECTION_AUTHOR',
	EDIT_BUNDLE_LABELS = 'EDIT_BUNDLE_LABELS',
	EDIT_BUNDLE_AUTHOR = 'EDIT_BUNDLE_AUTHOR',
}

export class PermissionService {
	public static hasPerm(user: Avo.User.User | undefined, permName: PermissionName): boolean {
		return this.getUserPermissions(user).includes(permName);
	}
	public static hasAtLeastOnePerm(
		user: Avo.User.User | undefined,
		permNames: PermissionName[]
	): boolean {
		return some(permNames, permName => this.getUserPermissions(user).includes(permName));
	}

	public static getUserPermissions(user: Avo.User.User | undefined): PermissionName[] {
		return get(user, 'profile.permissions', []);
	}

	public static async hasPermissions(
		permissions: Permissions,
		user: Avo.User.User | null
	): Promise<boolean> {
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
		permissionName: PermissionName,
		obj: any | null | undefined,
		user: Avo.User.User
	): Promise<boolean> {
		const userPermissions = PermissionService.getUserPermissions(user);
		if (!user || !userPermissions) {
			return false;
		}
		// Check if user has the requested permission
		const profileId = getProfileId(user);
		if (!userPermissions.includes(permissionName)) {
			return false;
		}
		// Special checks on top of name being in the permission list
		switch (permissionName) {
			case PermissionName.EDIT_OWN_COLLECTIONS:
				const collection = await CollectionService.fetchCollectionOrBundleById(
					obj,
					'collection'
				);
				const collectionOwnerId = get(collection, 'owner_profile_id');
				return !!profileId && !!collectionOwnerId && profileId === collectionOwnerId;

			case PermissionName.EDIT_OWN_BUNDLES:
				const bundle = await CollectionService.fetchCollectionOrBundleById(obj, 'bundle');
				const bundleOwnerId = get(bundle, 'owner_profile_id');
				return !!profileId && !!bundleOwnerId && profileId === bundleOwnerId;

			case PermissionName.VIEW_ITEMS_LINKED_TO_ASSIGNMENT:
				return this.checkViewItemsLinkedToAssignment(user, obj, 'ITEM');

			case PermissionName.VIEW_COLLECTIONS_LINKED_TO_ASSIGNMENT:
				return this.checkViewItemsLinkedToAssignment(user, obj, 'COLLECTIE');

			case PermissionName.VIEW_SEARCH_QUERIES_LINKED_TO_ASSIGNMENT:
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

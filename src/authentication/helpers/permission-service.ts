import { get, isString, some } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { ContentService } from '../../admin/content/content.service';
import { ContentPageInfo } from '../../admin/content/content.types';
import { CollectionService } from '../../collection/collection.service';
import { dataService } from '../../shared/services';

import { getProfileId } from './get-profile-id';
import {
	GET_LINKED_COLLECTIONS,
	GET_LINKED_ITEMS,
	GET_LINKED_SEARCH_QUERIES,
} from './permission-service.gql';

type PermissionInfo = { name: PermissionName; obj?: any | null };

export type Permissions = PermissionName | PermissionInfo | (PermissionName | PermissionInfo)[];

export enum PermissionName {
	EDIT_OWN_COLLECTIONS = 'EDIT_OWN_COLLECTIONS',
	CREATE_COLLECTIONS = 'CREATE_COLLECTIONS',
	SEARCH = 'SEARCH',
	ADD_HYPERLINK_COLLECTIONS = 'ADD_HYPERLINK_COLLECTIONS',
	EDIT_OWN_BUNDLES = 'EDIT_OWN_BUNDLES',
	CREATE_BUNDLES = 'CREATE_BUNDLES',
	EDIT_PROTECTED_PAGE_STATUS = 'EDIT_PROTECTED_PAGE_STATUS',
	PUBLISH_ALL_BUNDLES = 'PUBLISH_ALL_BUNDLES',
	PUBLISH_OWN_BUNDLES = 'PUBLISH_OWN_BUNDLES',
	PUBLISH_ALL_COLLECTIONS = 'PUBLISH_ALL_COLLECTIONS',
	PUBLISH_OWN_COLLECTIONS = 'PUBLISH_OWN_COLLECTIONS',
	CREATE_ASSIGNMENTS = 'CREATE_ASSIGNMENTS',
	EDIT_ASSIGNMENTS = 'EDIT_ASSIGNMENTS',
	VIEW_ASSIGNMENTS = 'VIEW_ASSIGNMENTS',
	CREATE_ASSIGNMENT_RESPONSE = 'CREATE_ASSIGNMENT_RESPONSE',
	EDIT_NAVIGATION_BARS = 'EDIT_NAVIGATION_BARS',
	VIEW_ADMIN_DASHBOARD = 'VIEW_ADMIN_DASHBOARD',
	EDIT_ANY_COLLECTIONS = 'EDIT_ANY_COLLECTIONS',
	EDIT_ANY_BUNDLES = 'EDIT_ANY_BUNDLES',
	VIEW_USERS = 'VIEW_USERS',
	CREATE_CONTENT_PAGES = 'CREATE_CONTENT_PAGES',
	EDIT_ANY_CONTENT_PAGES = 'EDIT_ANY_CONTENT_PAGES',
	EDIT_OWN_CONTENT_PAGES = 'EDIT_OWN_CONTENT_PAGES',
	DELETE_ANY_CONTENT_PAGES = 'DELETE_ANY_CONTENT_PAGES',
	DELETE_OWN_COLLECTIONS = 'DELETE_OWN_COLLECTIONS',
	DELETE_ANY_COLLECTIONS = 'DELETE_ANY_COLLECTIONS',
	DELETE_OWN_BUNDLES = 'DELETE_OWN_BUNDLES',
	DELETE_ANY_BUNDLES = 'DELETE_ANY_BUNDLES',
	VIEW_ANY_PUBLISHED_ITEMS = 'VIEW_ANY_PUBLISHED_ITEMS',
	VIEW_ANY_UNPUBLISHED_ITEMS = 'VIEW_ANY_UNPUBLISHED_ITEMS',
	CREATE_BOOKMARKS = 'CREATE_BOOKMARKS',
	PUBLISH_ITEMS = 'PUBLISH_ITEMS',
	VIEW_ITEMS_OVERVIEW = 'VIEW_ITEMS_OVERVIEW',
	VIEW_COLLECTIONS_OVERVIEW = 'VIEW_COLLECTIONS_OVERVIEW',
	VIEW_BUNDLES_OVERVIEW = 'VIEW_BUNDLES_OVERVIEW',
	VIEW_SEARCH_QUERIES_LINKED_TO_ASSIGNMENT = 'VIEW_SEARCH_QUERIES_LINKED_TO_ASSIGNMENT',
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
	ADD_ITEM_TO_COLLECTION_BY_PID = 'ADD_ITEM_TO_COLLECTION_BY_PID',
	ADD_COLLECTION_TO_BUNDLE_BY_ID = 'ADD_COLLECTION_TO_BUNDLE_BY_ID',
	VIEW_OWN_COLLECTIONS = 'VIEW_OWN_COLLECTIONS',
	VIEW_ANY_PUBLISHED_COLLECTIONS = 'VIEW_ANY_PUBLISHED_COLLECTIONS',
	VIEW_ANY_UNPUBLISHED_COLLECTIONS = 'VIEW_ANY_UNPUBLISHED_COLLECTIONS',
	VIEW_OWN_BUNDLES = 'VIEW_OWN_BUNDLES',
	VIEW_ANY_PUBLISHED_BUNDLES = 'VIEW_ANY_PUBLISHED_BUNDLES',
	VIEW_ANY_UNPUBLISHED_BUNDLES = 'VIEW_ANY_UNPUBLISHED_BUNDLES',
	PUBLISH_ANY_CONTENT_PAGE = 'PUBLISH_ANY_CONTENT_PAGE',
	UNPUBLISH_ANY_CONTENT_PAGE = 'UNPUBLISH_ANY_CONTENT_PAGE',

	EDIT_CONTENT_PAGE_AUTHOR = 'EDIT_CONTENT_PAGE_AUTHOR',
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
			// If the user doesn't have the permission, then we don't even need to check if the user is the owner of the object.
			return false;
		}
		if (!obj) {
			// Eg: Check if user has permission to view own collections, without checking a specific collection
			// This is used to show the workspace overview, since there only the owner's collections are shown
			return true;
		}
		// Special checks on top of name being in the permission list
		switch (permissionName) {
			case PermissionName.EDIT_OWN_COLLECTIONS:
			case PermissionName.PUBLISH_OWN_COLLECTIONS:
			case PermissionName.DELETE_OWN_COLLECTIONS:
			case PermissionName.VIEW_OWN_COLLECTIONS:
				const collection = isString(obj)
					? await CollectionService.fetchCollectionOrBundleById(obj, 'collection')
					: obj;
				const collectionOwnerId = get(collection, 'owner_profile_id');
				return !!profileId && !!collectionOwnerId && profileId === collectionOwnerId;

			case PermissionName.EDIT_OWN_BUNDLES:
			case PermissionName.PUBLISH_OWN_BUNDLES:
			case PermissionName.DELETE_OWN_BUNDLES:
			case PermissionName.VIEW_OWN_BUNDLES:
				const bundle = isString(obj)
					? await CollectionService.fetchCollectionOrBundleById(obj, 'bundle')
					: obj;
				const bundleOwnerId = get(bundle, 'owner_profile_id');
				return !!profileId && !!bundleOwnerId && profileId === bundleOwnerId;

			case PermissionName.EDIT_OWN_CONTENT_PAGES:
				const contentPage: ContentPageInfo = isString(obj)
					? await ContentService.fetchContentPageByPath(obj)
					: obj;
				const contentPageOwnerId = get(contentPage, 'user_profile_id');
				return !!profileId && !!contentPageOwnerId && profileId === contentPageOwnerId;

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

import { without } from 'lodash';

import { PermissionName } from '../src/authentication/helpers/permission-names';

export type TableOperation = 'insert' | 'update' | 'delete' | 'select';

export type ColumnCheck = { [columnName: string]: any };

export enum ContentTypeNumber {
	audio = 1,
	video = 2,
	collection = 3,
	bundle = 4,
}

export const PROFILE_UUID = 'X-HASURA-USER-ID';

export interface RowPermission {
	table: { name: string; schema: string };
	operation: TableOperation | TableOperation[];

	/**
	 * Dictionary of all the properties that should match.
	 * Current user profile id can be entered with the variable: PROFILE_UUID
	 * example:
	 *    {
	 *      type: 'collection',
	 *      owner_profile_id: PROFILE_UUID
	 *    }
	 **/
	check_columns?: ColumnCheck;

	/**
	 * What columns this permission gives access to. Defaults to all columns ['*']
	 * Either pass a list of allowed columns
	 * or a function that receives all columns from the table and removed the ones that are not allowed
	 **/
	columns?: string[] | ((allColumns: string[]) => string[]);
}

export const ROW_PERMISSIONS: { [permission in PermissionName]: RowPermission[] | null } = {
	EDIT_OWN_COLLECTIONS: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'update',
			check_columns: {
				type_id: ContentTypeNumber.collection,
				owner_profile_id: PROFILE_UUID,
			},
			columns: (allColumns: string[]) =>
				without(allColumns, 'is_deleted', 'owner_profile_id', 'is_public', 'published_at'),
		},
	],
	CREATE_COLLECTIONS: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'insert',
			check_columns: {
				type_id: ContentTypeNumber.collection,
				owner_profile_id: PROFILE_UUID,
			},
		},
		{
			table: { name: 'collection_fragments', schema: 'app' },
			operation: 'insert', // TODO check fragment is linked to collection for which the current user is the owner
		},
	],
	SEARCH: null, // Checked by proxy server, since this endpoint maps to Elasticsearch and not to GraphQL
	ADD_HYPERLINK_COLLECTIONS: null, // Currently we sanitize all html that goes into the database, so adding links is a minor security risk
	EDIT_OWN_BUNDLES: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'update',
			check_columns: {
				type_id: ContentTypeNumber.bundle,
				owner_profile_id: PROFILE_UUID,
			},
			columns: (allColumns: string[]) =>
				without(allColumns, 'is_deleted', 'owner_profile_id', 'is_public', 'published_at'),
		},
	],
	CREATE_BUNDLES: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'insert',
			check_columns: {
				type_id: ContentTypeNumber.bundle,
				owner_profile_id: PROFILE_UUID,
			},
		},
		{
			table: { name: 'collection_fragments', schema: 'app' },
			operation: 'insert', // TODO check fragment is linked to collection for which the current user is the owner
		},
	],
	EDIT_PROTECTED_PAGE_STATUS: [
		{
			table: { name: 'content', schema: 'app' },
			operation: 'update',
			columns: (allColumns: string[]) =>
				without(
					allColumns,
					'is_deleted',
					'is_public',
					'publish_at',
					'depublish_at',
					'user_profile_id',
					'published_at'
				),
		},
	],
	PUBLISH_ALL_BUNDLES: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'update',
			columns: (allColumns: string[]) =>
				without(allColumns, 'is_deleted', 'owner_profile_id'),
		},
	],
	PUBLISH_OWN_BUNDLES: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'update',
			columns: (allColumns: string[]) =>
				without(allColumns, 'is_deleted', 'owner_profile_id'),
			check_columns: {
				type_id: ContentTypeNumber.bundle,
				owner_profile_id: PROFILE_UUID,
			},
		},
	],
	PUBLISH_ALL_COLLECTIONS: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'update',
			columns: (allColumns: string[]) =>
				without(allColumns, 'is_deleted', 'owner_profile_id'),
		},
	],
	PUBLISH_OWN_COLLECTIONS: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'update',
			columns: (allColumns: string[]) =>
				without(allColumns, 'is_deleted', 'owner_profile_id'),
			check_columns: {
				type_id: ContentTypeNumber.collection,
				owner_profile_id: PROFILE_UUID,
			},
		},
	],
	CREATE_ASSIGNMENTS: [
		{
			table: { name: 'assignments', schema: 'app' },
			operation: 'insert',
			check_columns: { owner_profile_id: PROFILE_UUID },
		},
	],
	EDIT_ASSIGNMENTS: [
		{
			table: { name: 'assignments', schema: 'app' },
			operation: 'update',
			check_columns: { owner_profile_id: PROFILE_UUID },
		},
	],
	VIEW_ASSIGNMENTS: [
		{
			table: { name: 'assignments', schema: 'app' },
			operation: 'select',
		},
	],
	CREATE_ASSIGNMENT_RESPONSE: [
		{
			table: { name: 'assignment_responses', schema: 'app' },
			operation: ['select', 'insert', 'update'],
		},
	],
	EDIT_NAVIGATION_BARS: [
		{
			table: { name: 'content_nav_elements', schema: 'app' },
			operation: ['select', 'insert', 'update', 'delete'],
		},
	],
	VIEW_ADMIN_DASHBOARD: null, // Frontend permission to prevent users from accessing the avo admin dashboard
	EDIT_ANY_COLLECTIONS: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'update',
			columns: (allColumns: string[]) =>
				without(allColumns, 'is_deleted', 'owner_profile_id', 'is_public', 'published_at'),
		},
	],
	EDIT_ANY_BUNDLES: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'update',
			columns: (allColumns: string[]) =>
				without(allColumns, 'is_deleted', 'owner_profile_id', 'is_public', 'published_at'),
		},
	],
	VIEW_USERS: [
		{
			table: { name: 'users', schema: 'shared' },
			operation: 'select',
		},
		{
			table: { name: 'profiles', schema: 'users' },
			operation: 'select',
		},
		{
			table: { name: 'groups', schema: 'users' },
			operation: 'select',
		},
		{
			table: { name: 'permission_group_user_permissions', schema: 'users' },
			operation: 'select',
		},
		{
			table: { name: 'permission_groups', schema: 'users' },
			operation: 'select',
		},
		{
			table: { name: 'permissions', schema: 'users' },
			operation: 'select',
		},
	],
	CREATE_CONTENT_PAGES: [
		{
			table: { name: 'content', schema: 'app' },
			operation: 'insert',
			check_columns: { user_profile_id: PROFILE_UUID },
		},
	],
	EDIT_ANY_CONTENT_PAGES: [
		{
			table: { name: 'content', schema: 'app' },
			operation: 'update',
			columns: (allColumns: string[]) =>
				without(
					allColumns,
					'is_public',
					'published_at',
					'publish_at',
					'depublish_at',
					'is_protected'
				),
		},
	],
	EDIT_OWN_CONTENT_PAGES: [
		{
			table: { name: 'content', schema: 'app' },
			operation: 'update',
			check_columns: { user_profile_id: PROFILE_UUID },
			columns: (allColumns: string[]) =>
				without(
					allColumns,
					'is_public',
					'published_at',
					'publish_at',
					'depublish_at',
					'is_protected'
				),
		},
	],
	DELETE_ANY_CONTENT_PAGES: [
		{
			table: { name: 'content', schema: 'app' },
			operation: 'delete',
		},
	],
	DELETE_OWN_COLLECTIONS: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'delete',
			check_columns: {
				type_id: ContentTypeNumber.collection,
				owner_profile_id: PROFILE_UUID,
			},
		},
	],
	DELETE_ANY_COLLECTIONS: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'delete',
			check_columns: {
				type_id: ContentTypeNumber.collection,
			},
		},
	],
	DELETE_OWN_BUNDLES: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'delete',
			check_columns: {
				type_id: ContentTypeNumber.bundle,
				owner_profile_id: PROFILE_UUID,
			},
		},
	],
	DELETE_ANY_BUNDLES: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'delete',
			check_columns: {
				type_id: ContentTypeNumber.bundle,
			},
		},
	],
	VIEW_ANY_PUBLISHED_ITEMS: [
		{
			table: { name: 'item_meta', schema: 'app' },
			operation: 'select',
			check_columns: {
				is_published: true,
			},
			columns: (allColumns: string[]) => without(allColumns, 'browse_path'),
		},
		{
			table: { name: 'item_counts', schema: 'app' },
			operation: 'select',
		},
		{
			table: { name: 'item_plays', schema: 'app' },
			operation: 'select',
		},
		{
			table: { name: 'item_views', schema: 'app' },
			operation: 'select',
		},
	],
	VIEW_ANY_UNPUBLISHED_ITEMS: [
		{
			table: { name: 'item_meta', schema: 'app' },
			operation: 'select',
			check_columns: {
				is_published: false,
			},
			columns: (allColumns: string[]) => without(allColumns, 'browse_path'),
		},
		{
			table: { name: 'item_counts', schema: 'app' },
			operation: 'select',
		},
		{
			table: { name: 'item_plays', schema: 'app' },
			operation: 'select',
		},
		{
			table: { name: 'item_views', schema: 'app' },
			operation: 'select',
		},
	],
	CREATE_BOOKMARKS: [
		{
			table: { name: 'collection_bookmarks', schema: 'app' },
			operation: 'insert',
			check_columns: {
				profile_id: PROFILE_UUID,
			},
		},
		{
			table: { name: 'item_bookmarks', schema: 'app' },
			operation: 'insert',
			check_columns: {
				profile_id: PROFILE_UUID,
			},
		},
	],
	PUBLISH_ITEMS: [
		{
			table: { name: 'items', schema: 'shared' },
			operation: 'select',
		},
		{
			table: { name: 'items', schema: 'shared' },
			operation: 'update',
			columns: ['status'],
		},
	],
	VIEW_ITEMS_OVERVIEW: null, // This permission protects the frontend route. The database rows are protected by VIEW_ANY_PUBLISHED_ITEMS, VIEW_ANY_UNPUBLISHED_ITEMS
	VIEW_COLLECTIONS_OVERVIEW: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'select',
			check_columns: {
				type_id: ContentTypeNumber.collection,
			},
		},
	],
	VIEW_BUNDLES_OVERVIEW: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'select',
			check_columns: {
				type_id: ContentTypeNumber.bundle,
			},
		},
	],
	EDIT_INTERACTIVE_TOURS: [
		{
			table: { name: 'interactive_tour', schema: 'app' },
			operation: ['select', 'insert', 'update', 'delete'],
		},
	],
	EDIT_TRANSLATIONS: [
		{
			table: { name: 'site_variables', schema: 'app' },
			operation: 'update', // Only update existing frontend or backend translations row. New site variables will need to be added by the admin user and not by the avo user role
		},
	],
	EDIT_USER_GROUPS: [
		{
			table: { name: 'groups', schema: 'users' },
			operation: ['select', 'insert', 'update', 'delete'],
		},
		{
			table: { name: 'group_user_permission_groups', schema: 'users' },
			operation: ['select', 'insert', 'update', 'delete'],
		},
	],
	EDIT_PERMISSION_GROUPS: [
		{
			table: { name: 'permission_groups', schema: 'users' },
			operation: ['select', 'insert', 'update', 'delete'],
		},
		{
			table: { name: 'permissions', schema: 'users' },
			operation: 'select',
		},
	],
	EDIT_BAN_USER_STATUS: [
		{
			table: { name: 'users', schema: 'shared' },
			operation: 'update',
			columns: ['is_blocked'],
		},
	],
	VIEW_EDUCATION_LEVEL_ON_PROFILE_PAGE: null, // data is sent to client but not visually shown, nothing can be checked in the database
	EDIT_EDUCATION_LEVEL_ON_PROFILE_PAGE: null, // TODO Check on the proxy server route
	REQUIRED_EDUCATION_LEVEL_ON_PROFILE_PAGE: null, // TODO Check on the proxy server route
	VIEW_EDUCATIONAL_ORGANISATION_ON_PROFILE_PAGE: null, // data is sent to client but not visually shown, nothing can be checked in the database
	EDIT_EDUCATIONAL_ORGANISATION_ON_PROFILE_PAGE: null, // TODO Check on the proxy server route
	REQUIRED_EDUCATIONAL_ORGANISATION_ON_PROFILE_PAGE: null, // TODO Check on the proxy server route
	VIEW_ORGANISATION_ON_PROFILE_PAGE: null, // data is sent to client but not visually shown, nothing can be checked in the database
	EDIT_ORGANISATION_ON_PROFILE_PAGE: null, // TODO Check on the proxy server route
	REQUIRED_ORGANISATION_ON_PROFILE_PAGE: null, // TODO Check on the proxy server route
	VIEW_SUBJECTS_ON_PROFILE_PAGE: null, // data is sent to client but not visually shown, nothing can be checked in the database
	EDIT_SUBJECTS_ON_PROFILE_PAGE: null, // TODO Check on the proxy server route
	REQUIRED_SUBJECTS_ON_PROFILE_PAGE: null, // TODO Check on the proxy server route
	VIEW_NEWSLETTERS_PAGE: null, // checked in proxy route that forwards requests to campaign monitor api
	VIEW_NOTIFICATIONS_PAGE: null, // Currently not used
	EDIT_COLLECTION_LABELS: [
		{
			table: { name: 'collection_labels', schema: 'app' },
			operation: ['select', 'insert', 'update', 'delete'],
			check_columns: {
				type_id: ContentTypeNumber.collection,
			},
		},
	],
	EDIT_COLLECTION_AUTHOR: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'update',
			columns: ['owner_profile_id'],
			check_columns: {
				type_id: ContentTypeNumber.collection,
			},
		},
	],
	EDIT_BUNDLE_LABELS: [
		{
			table: { name: 'collection_labels', schema: 'app' },
			operation: 'update',
			check_columns: {
				type_id: ContentTypeNumber.bundle,
			},
		},
	],
	EDIT_BUNDLE_AUTHOR: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'update',
			columns: ['owner_profile_id'],
			check_columns: {
				type_id: ContentTypeNumber.bundle,
			},
		},
	],
	EDIT_CONTENT_PAGE_LABELS: [
		{
			table: { name: 'content_labels', schema: 'app' },
			operation: ['select', 'insert', 'update', 'delete'],
		},
		{
			table: { name: 'content_labels', schema: 'app' },
			operation: ['select', 'insert', 'update', 'delete'],
		},
	],
	ADD_ITEM_TO_COLLECTION_BY_PID: [
		{
			table: { name: 'collection_fragments', schema: 'app' },
			operation: 'insert',
			check_columns: {
				type: 'ITEM',
			},
		},
	],
	ADD_COLLECTION_TO_BUNDLE_BY_ID: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'insert',
			check_columns: {
				type: 'COLLECTION',
			},
		},
	],
	VIEW_OWN_COLLECTIONS: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'select',
			check_columns: {
				type_id: ContentTypeNumber.collection,
				owner_profile_id: PROFILE_UUID,
			},
		},
	],
	VIEW_ANY_PUBLISHED_COLLECTIONS: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'select',
			check_columns: {
				type_id: ContentTypeNumber.collection,
				is_public: true,
			},
		},
	],
	VIEW_ANY_UNPUBLISHED_COLLECTIONS: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'select',
			check_columns: {
				type_id: ContentTypeNumber.collection,
				is_public: false,
			},
		},
	],
	VIEW_OWN_BUNDLES: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'select',
			check_columns: {
				type_id: ContentTypeNumber.bundle,
				owner_profile_id: PROFILE_UUID,
			},
		},
	],
	VIEW_ANY_PUBLISHED_BUNDLES: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'select',
			check_columns: {
				type_id: ContentTypeNumber.bundle,
				is_public: true,
			},
		},
	],
	VIEW_ANY_UNPUBLISHED_BUNDLES: [
		{
			table: { name: 'collections', schema: 'app' },
			operation: 'select',
			check_columns: {
				type_id: ContentTypeNumber.bundle,
				is_public: false,
			},
		},
	],
	PUBLISH_ANY_CONTENT_PAGE: [
		{
			table: { name: 'content', schema: 'app' },
			operation: 'update',
			columns: ['is_public', 'publish_at', 'depublish_at', 'published_at'],
		},
	],
	UNPUBLISH_ANY_CONTENT_PAGE: [
		{
			table: { name: 'content', schema: 'app' },
			operation: 'update',
			columns: ['is_public', 'publish_at', 'depublish_at', 'published_at'],
		},
	],
	EDIT_CONTENT_PAGE_AUTHOR: [
		{
			table: { name: 'content', schema: 'app' },
			operation: 'update',
			columns: ['user_profile_id'],
		},
	],
};

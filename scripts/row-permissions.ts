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
	table: string;
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
			table: 'app_collections',
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
			table: 'app_collections',
			operation: 'insert',
			check_columns: {
				type_id: ContentTypeNumber.collection,
				owner_profile_id: PROFILE_UUID,
			},
		},
		{
			table: 'app_collection_fragments',
			operation: 'insert', // TODO check fragment is linked to collection for which the current user is the owner
		},
	],
	SEARCH: null, // Checked by proxy server, since this endpoint maps to Elasticsearch and not to GraphQL
	ADD_HYPERLINK_COLLECTIONS: null, // Currently we sanitize all html that goes into the database, so adding links is a minor security risk
	EDIT_OWN_BUNDLES: [
		{
			table: 'app_collections',
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
			table: 'app_collections',
			operation: 'insert',
			check_columns: {
				type_id: ContentTypeNumber.bundle,
				owner_profile_id: PROFILE_UUID,
			},
		},
		{
			table: 'app_collection_fragments',
			operation: 'insert', // TODO check fragment is linked to collection for which the current user is the owner
		},
	],
	EDIT_PROTECTED_PAGE_STATUS: [
		{
			table: 'app_content',
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
			table: 'app_collections',
			operation: 'update',
			columns: (allColumns: string[]) =>
				without(allColumns, 'is_deleted', 'owner_profile_id'),
		},
	],
	PUBLISH_OWN_BUNDLES: [
		{
			table: 'app_collections',
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
			table: 'app_collections',
			operation: 'update',
			columns: (allColumns: string[]) =>
				without(allColumns, 'is_deleted', 'owner_profile_id'),
		},
	],
	PUBLISH_OWN_COLLECTIONS: [
		{
			table: 'app_collections',
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
			table: 'app_assignments',
			operation: 'insert',
			check_columns: { owner_profile_id: PROFILE_UUID },
		},
	],
	EDIT_ASSIGNMENTS: [
		{
			table: 'app_assignments',
			operation: 'update',
			check_columns: { owner_profile_id: PROFILE_UUID },
		},
	],
	VIEW_ASSIGNMENTS: [
		{
			table: 'app_assignments',
			operation: 'select',
		},
	],
	CREATE_ASSIGNMENT_RESPONSE: [
		{
			table: 'app_assignment_responses',
			operation: ['select', 'insert', 'update'],
		},
	],
	EDIT_NAVIGATION_BARS: [
		{
			table: 'app_content_nav_elements',
			operation: ['select', 'insert', 'update', 'delete'],
		},
	],
	VIEW_ADMIN_DASHBOARD: null, // Frontend permission to prevent users from accessing the avo admin dashboard
	EDIT_ANY_COLLECTIONS: [
		{
			table: 'app_collections',
			operation: 'update',
			columns: (allColumns: string[]) =>
				without(allColumns, 'is_deleted', 'owner_profile_id', 'is_public', 'published_at'),
		},
	],
	EDIT_ANY_BUNDLES: [
		{
			table: 'app_collections',
			operation: 'update',
			columns: (allColumns: string[]) =>
				without(allColumns, 'is_deleted', 'owner_profile_id', 'is_public', 'published_at'),
		},
	],
	VIEW_USERS: [
		{
			table: 'shared_users',
			operation: 'select',
		},
		{
			table: 'users_profiles',
			operation: 'select',
		},
		{
			table: 'users_groups',
			operation: 'select',
		},
		{
			table: 'users_permission_group_user_permissions',
			operation: 'select',
		},
		{
			table: 'users_permission_groups',
			operation: 'select',
		},
		{
			table: 'users_permissions',
			operation: 'select',
		},
	],
	CREATE_CONTENT_PAGES: [
		{
			table: 'app_content',
			operation: 'insert',
			check_columns: { user_profile_id: PROFILE_UUID },
		},
	],
	EDIT_ANY_CONTENT_PAGES: [
		{
			table: 'app_content',
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
			table: 'app_content',
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
			table: 'app_content',
			operation: 'delete',
		},
	],
	DELETE_OWN_COLLECTIONS: [
		{
			table: 'app_collections',
			operation: 'delete',
			check_columns: {
				type_id: ContentTypeNumber.collection,
				owner_profile_id: PROFILE_UUID,
			},
		},
	],
	DELETE_ANY_COLLECTIONS: [
		{
			table: 'app_collections',
			operation: 'delete',
			check_columns: {
				type_id: ContentTypeNumber.collection,
			},
		},
	],
	DELETE_OWN_BUNDLES: [
		{
			table: 'app_collections',
			operation: 'delete',
			check_columns: {
				type_id: ContentTypeNumber.bundle,
				owner_profile_id: PROFILE_UUID,
			},
		},
	],
	DELETE_ANY_BUNDLES: [
		{
			table: 'app_collections',
			operation: 'delete',
			check_columns: {
				type_id: ContentTypeNumber.bundle,
			},
		},
	],
	VIEW_ANY_PUBLISHED_ITEMS: [
		{
			table: 'app_item_meta',
			operation: 'select',
			check_columns: {
				is_published: true,
			},
			columns: (allColumns: string[]) => without(allColumns, 'browse_path'),
		},
		{
			table: 'app_item_counts',
			operation: 'select',
		},
		{
			table: 'app_item_plays',
			operation: 'select',
		},
		{
			table: 'app_item_views',
			operation: 'select',
		},
	],
	VIEW_ANY_UNPUBLISHED_ITEMS: [
		{
			table: 'app_item_meta',
			operation: 'select',
			check_columns: {
				is_published: false,
			},
			columns: (allColumns: string[]) => without(allColumns, 'browse_path'),
		},
		{
			table: 'app_item_counts',
			operation: 'select',
		},
		{
			table: 'app_item_plays',
			operation: 'select',
		},
		{
			table: 'app_item_views',
			operation: 'select',
		},
	],
	CREATE_BOOKMARKS: [
		{
			table: 'app_collection_bookmarks',
			operation: 'insert',
			check_columns: {
				profile_id: PROFILE_UUID,
			},
		},
		{
			table: 'app_item_bookmarks',
			operation: 'insert',
			check_columns: {
				profile_id: PROFILE_UUID,
			},
		},
	],
	PUBLISH_ITEMS: [
		{
			table: 'shared_items',
			operation: 'select',
		},
		{
			table: 'shared_items',
			operation: 'update',
			columns: ['status'],
		},
	],
	VIEW_ITEMS_OVERVIEW: null, // This permission protects the frontend route. The database rows are protected by VIEW_ANY_PUBLISHED_ITEMS, VIEW_ANY_UNPUBLISHED_ITEMS
	VIEW_COLLECTIONS_OVERVIEW: [
		{
			table: 'app_collections',
			operation: 'select',
			check_columns: {
				type_id: ContentTypeNumber.collection,
			},
		},
	],
	VIEW_BUNDLES_OVERVIEW: [
		{
			table: 'app_collections',
			operation: 'select',
			check_columns: {
				type_id: ContentTypeNumber.bundle,
			},
		},
	],
	EDIT_INTERACTIVE_TOURS: [
		{
			table: 'app_interactive_tour',
			operation: ['select', 'insert', 'update', 'delete'],
		},
	],
	EDIT_TRANSLATIONS: [
		{
			table: 'app_site_variables',
			operation: 'update', // Only update existing frontend or backend translations row. New site variables will need to be added by the admin user and not by the avo user role
		},
	],
	EDIT_USER_GROUPS: [
		{
			table: 'users_groups',
			operation: ['select', 'insert', 'update', 'delete'],
		},
		{
			table: 'users_group_user_permission_groups',
			operation: ['select', 'insert', 'update', 'delete'],
		},
	],
	EDIT_PERMISSION_GROUPS: [
		{
			table: 'users_permission_groups',
			operation: ['select', 'insert', 'update', 'delete'],
		},
		{
			table: 'users_permissions',
			operation: 'select',
		},
	],
	EDIT_BAN_USER_STATUS: [
		{
			table: 'shared_users',
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
			table: 'app_collection_labels',
			operation: ['select', 'insert', 'update', 'delete'],
			check_columns: {
				type_id: ContentTypeNumber.collection,
			},
		},
	],
	EDIT_COLLECTION_AUTHOR: [
		{
			table: 'app_collections',
			operation: 'update',
			columns: ['owner_profile_id'],
			check_columns: {
				type_id: ContentTypeNumber.collection,
			},
		},
	],
	EDIT_BUNDLE_LABELS: [
		{
			table: 'app_collection_labels',
			operation: 'update',
			check_columns: {
				type_id: ContentTypeNumber.bundle,
			},
		},
	],
	EDIT_BUNDLE_AUTHOR: [
		{
			table: 'app_collections',
			operation: 'update',
			columns: ['owner_profile_id'],
			check_columns: {
				type_id: ContentTypeNumber.bundle,
			},
		},
	],
	EDIT_CONTENT_PAGE_LABELS: [
		{
			table: 'app_content_labels',
			operation: ['select', 'insert', 'update', 'delete'],
		},
		{
			table: 'app_content_labels',
			operation: ['select', 'insert', 'update', 'delete'],
		},
	],
	ADD_ITEM_TO_COLLECTION_BY_PID: [
		{
			table: 'app_collection_fragments',
			operation: 'insert',
			check_columns: {
				type: 'ITEM',
			},
		},
	],
	ADD_COLLECTION_TO_BUNDLE_BY_ID: [
		{
			table: 'app_collections',
			operation: 'insert',
			check_columns: {
				type: 'COLLECTION',
			},
		},
	],
	VIEW_OWN_COLLECTIONS: [
		{
			table: 'app_collections',
			operation: 'select',
			check_columns: {
				type_id: ContentTypeNumber.collection,
				owner_profile_id: PROFILE_UUID,
			},
		},
	],
	VIEW_ANY_PUBLISHED_COLLECTIONS: [
		{
			table: 'app_collections',
			operation: 'select',
			check_columns: {
				type_id: ContentTypeNumber.collection,
				is_public: true,
			},
		},
	],
	VIEW_ANY_UNPUBLISHED_COLLECTIONS: [
		{
			table: 'app_collections',
			operation: 'select',
			check_columns: {
				type_id: ContentTypeNumber.collection,
				is_public: false,
			},
		},
	],
	VIEW_OWN_BUNDLES: [
		{
			table: 'app_collections',
			operation: 'select',
			check_columns: {
				type_id: ContentTypeNumber.bundle,
				owner_profile_id: PROFILE_UUID,
			},
		},
	],
	VIEW_ANY_PUBLISHED_BUNDLES: [
		{
			table: 'app_collections',
			operation: 'select',
			check_columns: {
				type_id: ContentTypeNumber.bundle,
				is_public: true,
			},
		},
	],
	VIEW_ANY_UNPUBLISHED_BUNDLES: [
		{
			table: 'app_collections',
			operation: 'select',
			check_columns: {
				type_id: ContentTypeNumber.bundle,
				is_public: false,
			},
		},
	],
	PUBLISH_ANY_CONTENT_PAGE: [
		{
			table: 'app_content',
			operation: 'update',
			columns: ['is_public', 'publish_at', 'depublish_at', 'published_at'],
		},
	],
	UNPUBLISH_ANY_CONTENT_PAGE: [
		{
			table: 'app_content',
			operation: 'update',
			columns: ['is_public', 'publish_at', 'depublish_at', 'published_at'],
		},
	],
	EDIT_CONTENT_PAGE_AUTHOR: [
		{
			table: 'app_content',
			operation: 'update',
			columns: ['user_profile_id'],
		},
	],
};

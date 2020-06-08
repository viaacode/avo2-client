import { FilterableTableState } from '../shared/components/FilterTable/FilterTable';

export type UserOverviewTableCol =
	| 'first_name'
	| 'last_name'
	| 'mail'
	| 'stamboek'
	| 'created_at'
	| 'updated_at'
	| 'actions';

export interface UserTableState extends FilterableTableState {
	first_name: string;
	last_name: string;
	mail: string;
	stamboek: string;
	created_at: string;
}

export interface RawUserGroupLink {
	groups: RawUserGroup[];
}

export interface RawUserGroup {
	id: number;
	label: string;
	group_user_permission_groups: RawUserGroupPermissionGroupLink[];
}

export interface RawUserGroupPermissionGroupLink {
	permission_group: RawPermissionGroupLink;
}

export interface RawPermissionGroupLink {
	id: number;
	label: string;
	permission_group_user_permissions: RawPermissionLink[];
}

export interface RawPermissionLink {
	permission: RawPermission;
}

export interface RawPermission {
	id: number;
	label: string;
}

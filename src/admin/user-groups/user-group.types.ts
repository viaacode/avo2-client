// TODO Use permission and permission group from src\admin\permission-groups\permission-group.types.ts once it is merged
import { FilterableTableState } from '../shared/components/FilterTable/FilterTable';

export interface Permission {
	id: number;
	label: string;
	description: string | null;
	created_at: string;
	updated_at: string;
}

export interface PermissionGroup {
	id: number;
	label: string;
	description: string | null;
	created_at: string;
	updated_at: string;
	permissions?: Permission[];
}

export interface UserGroup {
	id: number;
	label: string;
	description: string | null;
	created_at: string;
	updated_at: string;
	permissionGroups: PermissionGroup[];
}

export interface UserGroupEditFormErrorState {
	label?: string;
	description?: string;
}

export interface UserGroupTableState extends FilterableTableState {
	label: string;
	description: string;
	created_at: string;
	updated_at: string;
}

export type UserGroupOverviewTableCols =
	| 'label'
	| 'description'
	| 'created_at'
	| 'updated_at'
	| 'actions';

export type PermissionGroupTableCols =
	| 'label'
	| 'description'
	| 'created_at'
	| 'updated_at'
	| 'actions';

import { FilterableTableState } from '../shared/components/FilterTable/FilterTable';

export type PermissionGroupOverviewTableCols =
	| 'label'
	| 'description'
	| 'created_at'
	| 'updated_at'
	| 'actions';

export type PermissionsTableCols = 'label' | 'description' | 'actions';

export interface PermissionGroup {
	id: number;
	label: string;
	description: string | null;
	created_at: string;
	updated_at: string;
	permissions?: Permission[];
}

export interface Permission {
	id: number;
	label: string;
	description: string | null;
	created_at: string;
	updated_at: string;
}

export interface PermissionGroupEditFormErrorState {
	label?: string;
	description?: string;
}

export interface PermissionGroupTableState extends FilterableTableState {
	label: string;
	description: string | null;
	created_at: string;
	updated_at: string;
}

import { DefaultComponentProps } from '@meemoo/admin-core-ui';
import { ReactNode } from 'react';

import { FilterableTableState } from '../../components/FilterTable/FilterTable';
import { PermissionData } from '../permissions/permissions.types';

export interface UserGroupOverviewProps extends DefaultComponentProps {
	onChangePermissions?: (hasChanges: boolean) => void;
	renderSearchButtons?: (search?: string) => ReactNode;
}

export interface UserGroupOverviewRef {
	onCancel: () => void;
	onSave: () => void;
	onSearch: (value?: string) => void;
}

export interface UserGroup {
	id: number | string;
	label: string;
	description: string | null;
	created_at: string;
	updated_at: string;
	permissions: PermissionName[];
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

export interface UserGroupDb {
	id: number | string;
	name: string;
	label: string;
	permissions: PermissionData[];
}

export type PermissionRow = { row: { original: PermissionData } };

export interface UserGroupUpdates {
	updates: UserGroupUpdate[];
}

export interface UserGroupUpdate {
	userGroupId: string;
	permissionId: string;
	hasPermission: boolean;
}

export interface UserGroupUpdateResponse {
	deleted: number;
	inserted: number;
}

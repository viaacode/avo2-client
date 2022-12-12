import { PermissionData } from '../permissions/permissions.types';

export interface UserGroupOverviewRef {
	onCancel: () => void;
	onSave: () => void;
	onSearch: (value?: string) => void;
}

export interface UserGroupDb {
	id: number | string;
	name: string;
	label: string;
	permissions: PermissionData[];
}

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

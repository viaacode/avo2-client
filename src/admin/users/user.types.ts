import { UserTempAccess } from '@viaa/avo2-types/types/user';

import { FilterableTableState } from '../shared/components/FilterTable/FilterTable';

export type UserOverviewTableCol =
	| 'id'
	| 'first_name'
	| 'last_name'
	| 'mail'
	| 'user_group'
	| 'business_category'
	| 'is_exception'
	| 'is_blocked'
	| 'blocked_at'
	| 'unblocked_at'
	| 'stamboek'
	| 'organisation'
	| 'created_at'
	| 'education_levels'
	| 'subjects'
	| 'idps'
	| 'educational_organisations'
	| 'last_access_at'
	| 'temp_access'
	| 'temp_access_from'
	| 'temp_access_until';

export interface UserTableState extends FilterableTableState {
	first_name: string;
	last_name: string;
	mail: string;
	stamboek: string;
	business_category: string;
	is_exception: boolean;
	is_blocked: boolean;
	blocked_at: {
		date: string;
	};
	unblocked_at: {
		date: string;
	};
	created_at: string;
	education_levels: string[];
	subjects: string[];
	idps: string[];
	educational_organisations: string[];
	columns: string[];
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

export type UserBulkAction = 'block' | 'unblock' | 'delete' | 'change_subjects' | 'export';

export interface DeleteContentCounts {
	publicCollections: number;
	privateCollections: number;
	assignments: number;
	bookmarks: number;
	publicContentPages: number;
	privateContentPages: number;
	quickLanes: number;
}

export interface UserSummaryView {
	user_id: string;
	full_name: string;
	first_name: string;
	last_name: string;
	mail: string;
	last_access_at: string | null;
	user: {
		temp_access: UserTempAccess | null;
	};
	is_blocked: boolean;
	last_blocked_at: {
		aggregate: {
			max: {
				created_at: string | null;
			};
		};
	};
	last_unblocked_at: {
		aggregate: {
			max: {
				created_at: string | null;
			};
		};
	};
	profile_id: string;
	stamboek: string | null;
	acc_created_at: string;
	role_id: number | null;
	role_name: string | null;
	group_id: number | null;
	group_name: string | null;
	company_name: string | null;
	is_exception: boolean;
	business_category: string | null;
	idps: {
		idp: string;
	}[];
	classifications: {
		key: string;
	}[];
	contexts: {
		key: string;
	}[];
	organisations: {
		organization_id: string;
		unit_id?: string;
		organization?: {
			ldap_description: string;
		};
	}[];
}

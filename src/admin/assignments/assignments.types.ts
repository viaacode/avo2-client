import { type FilterableTableState } from '@meemoo/admin-core-ui/dist/admin.mjs';

export interface AssignmentsOverviewTableState extends FilterableTableState {
	title: string;
	author: string;
	author_user_group: string;
	created_at: string;
	updated_at: string;
	deadline_at: string;
	quality_labels: string[];
	status: ('true' | 'false')[];
	responses: ('true' | 'false')[];
	share_type: string;
	subjects: string[];
	education_levels: string[]; // These are the lom values for the assignment publication details
	education_degrees: string[]; // These are the lom values for the assignment publication details
	education_level_id: string[]; // This is the type of assignment: Lager onderwijs or secundair onderwijs. also known as "Kenmerk"
	assignment_labels: string[]; // Quality labels. eg: Redactie, Partner, ...
	organisation: string[];
}

export interface AssignmentMarcomTableState extends AssignmentsOverviewTableState {
	marcom_last_communication_channel_type: string[];
	marcom_last_communication_at: string;
	marcom_last_communication_channel_name: string[];
	marcom_klascement: boolean;
}

export enum AssignmentsBulkAction {
	DELETE = 'DELETE',
	CHANGE_AUTHOR = 'CHANGE_AUTHOR',
	EXPORT_ALL = 'EXPORT_ALL',
}

export type AssignmentSortProps =
	| 'title'
	| 'owner_profile_id'
	| 'author_user_group'
	| 'last_updated_by_profile'
	| 'created_at'
	| 'updated_at'
	| 'is_public'
	| 'is_managed'
	| 'views'
	| 'bookmarks'
	| 'copies'
	| 'in_bundle'
	| 'quick_lane_links'
	| 'contributors'
	| 'share_type'
	| 'share_type_order'
	| 'marcom_last_communication_channel_type'
	| 'marcom_last_communication_channel_name'
	| 'marcom_last_communication_at'
	| 'marcom_klascement';

import { type FilterableTableState } from '../shared/components/FilterTable/FilterTable';

export type AssignmentsOverviewTableCols =
	| 'title'
	| 'author'
	| 'created_at'
	| 'updated_at'
	| 'deadline_at'
	| 'status'
	| 'pupilCollections'
	| 'views'
	| 'actions'
	| 'share_type';

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
	education_level_id: string[]; // This is the type of assignment: Lager onderwijs or secundair onderwijs. also known as "Kenmerk"
}

export enum AssignmentsBulkAction {
	DELETE = 'DELETE',
	CHANGE_AUTHOR = 'CHANGE_AUTHOR',
	EXPORT_ALL = 'EXPORT_ALL',
}

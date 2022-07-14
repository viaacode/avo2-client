import { FilterableTableState } from '../shared/components/FilterTable/FilterTable';

export type AssignmentsOverviewTableCols =
	| 'title'
	| 'author'
	| 'created_at'
	| 'updated_at'
	| 'deadline_at'
	| 'status'
	| 'pupilCollections'
	| 'views'
	| 'actions';

export interface AssignmentsOverviewTableState extends FilterableTableState {
	title: string;
	author: string;
	created_at: string;
	updated_at: string;
	deadline_at: string;
	status: ('true' | 'false')[];
	pupilCollections: ('true' | 'false')[];
}

export type AssignmentsBulkAction = 'delete' | 'change_author';

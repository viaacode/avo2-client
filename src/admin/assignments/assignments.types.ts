import { FilterableTableState } from '../shared/components/FilterTable/FilterTable';

export type AssignmentsOverviewTableCols =
	| 'title'
	| 'owner'
	| 'created_at'
	| 'updated_at'
	| 'expiry_date'
	| 'status'
	| 'responses'
	| 'views'
	| 'actions';

export interface AssignmentsOverviewTableState extends FilterableTableState {
	title: string;
	owner: string;
	created_at: string;
	updated_at: string;
	deadline_at: string;
	status: ('true' | 'false')[];
}

export type AssignmentsBulkAction = 'delete' | 'change_author';

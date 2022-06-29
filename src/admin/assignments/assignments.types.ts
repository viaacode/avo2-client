import { FilterableTableState } from '../shared/components/FilterTable/FilterTable';

export type AssignmentsOverviewTableCols =
	| 'title'
	| 'owner'
	| 'created_at'
	| 'updated_at'
	| 'deadline_at'
	| 'status'
	| 'pupilCollections'
	| 'views'
	| 'actions';

export type PupilCollectionOverviewTableColumns =
	| 'title'
	| 'pupil'
	| 'assignmentTitle'
	| 'teacher'
	| 'created_at'
	| 'updated_at'
	| 'deadline_at'
	| 'status'
	| 'actions';

export interface AssignmentsOverviewTableState extends FilterableTableState {
	title: string;
	owner: string;
	created_at: string;
	updated_at: string;
	deadline_at: string;
	status: ('true' | 'false')[];
	pupilCollections: ('true' | 'false')[];
}

export interface PupilCollectionsOverviewTableState extends FilterableTableState {
	title: string;
	pupil: string;
	assignmentTitle: string;
	teacher: string;
	created_at: string;
	updated_at: string;
	deadline_at: string;
	status: ('true' | 'false')[];
}

export type AssignmentsBulkAction = 'delete' | 'change_author';

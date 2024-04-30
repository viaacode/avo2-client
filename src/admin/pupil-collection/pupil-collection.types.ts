import { type FilterableTableState } from '../shared/components/FilterTable/FilterTable';

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

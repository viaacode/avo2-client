import { type FilterableTableState } from '@meemoo/admin-core-ui/dist/admin.mjs';

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

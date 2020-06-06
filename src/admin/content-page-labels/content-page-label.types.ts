import { Avo } from '@viaa/avo2-types';

import { FilterableTableState } from '../shared/components/FilterTable/FilterTable';

export type ContentPageLabelOverviewTableCols =
	| 'label'
	| 'content_type'
	| 'created_at'
	| 'updated_at'
	| 'actions';

export interface ContentPageLabel {
	id: number;
	label: string;
	content_type: Avo.ContentPage.Type;
	created_at: string;
	updated_at: string;
}

export interface ContentPageLabelEditFormErrorState {
	label?: string;
	content_type?: string;
}

export interface ContentPageLabelTableState extends FilterableTableState {
	label: string;
	content_type: Avo.ContentPage.Type | null;
	created_at: string;
	updated_at: string;
}

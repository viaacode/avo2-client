import { ContentPageDb, ContentPageType } from '../content/content.types';
import { FilterableTableState } from '../shared/components/FilterTable/FilterTable';
import { PickerItem } from '../shared/types';

export type ContentPageLabelOverviewTableCols =
	| 'label'
	| 'content_type'
	| 'link_to'
	| 'created_at'
	| 'updated_at'
	| 'actions';

export type ContentPageLabel = ContentPageDb['content_content_labels'][0]['content_label'];

export interface ContentPageLabelEditFormErrorState {
	label?: string;
	content_type?: string;
	link_to?: string;
}

export interface ContentPageLabelTableState extends FilterableTableState {
	label: string;
	content_type: ContentPageType | null;
	link_to: PickerItem | null;
	created_at: string;
	updated_at: string;
}

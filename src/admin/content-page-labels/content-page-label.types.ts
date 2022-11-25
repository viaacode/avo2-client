import { ContentPageDb } from '@meemoo/admin-core-ui';
import { Avo } from '@viaa/avo2-types';

import {
	GetContentLabelsByContentTypeQuery,
	GetContentPageLabelByIdQuery,
} from '../../shared/generated/graphql-db-types';
import { FilterableTableState } from '../shared/components/FilterTable/FilterTable';
import { PickerItem } from '../shared/types';

export type ContentPageLabelOverviewTableCols =
	| 'label'
	| 'content_type'
	| 'link_to'
	| 'created_at'
	| 'updated_at'
	| 'actions';

export type ContentPageLabel = Exclude<
	| ContentPageDb['content_content_labels'][0]['content_label']
	| GetContentPageLabelByIdQuery['app_content_labels'][0]
	| GetContentLabelsByContentTypeQuery['app_content_labels'][0],
	null | undefined
>;

export interface ContentPageLabelEditFormErrorState {
	label?: string;
	content_type?: string;
	link_to?: string;
}

export interface ContentPageLabelTableState extends FilterableTableState {
	label: string;
	content_type: Avo.ContentPage.Type | null;
	link_to: PickerItem | null;
	created_at: string;
	updated_at: string;
}

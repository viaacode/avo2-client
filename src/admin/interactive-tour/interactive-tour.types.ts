import { FilterableTableState } from '../shared/components/FilterTable/FilterTable';

export type InteractiveTourOverviewTableCols =
	| 'name'
	| 'page_id'
	| 'created_at'
	| 'updated_at'
	| 'actions';

export interface InteractiveTourEditFormErrorState {
	name?: string;
	page_id?: string;
}

export interface InteractiveTourTableState extends FilterableTableState {
	name: string;
	page_id: string;
	created_at: string;
	updated_at: string;
}

export type InteractiveTourPageType = 'static' | 'content';

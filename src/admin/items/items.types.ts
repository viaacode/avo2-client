import { FilterableTableState } from '../shared/components/FilterTable/FilterTable';

export type ItemsOverviewTableCols =
	| 'depublish_at'
	| 'description'
	| 'duration'
	| 'expiry_date'
	| 'external_id'
	| 'uid'
	| 'is_deleted'
	| 'is_published'
	| 'issued'
	| 'lom_classification'
	| 'lom_context'
	| 'lom_intendedenduserrole'
	| 'lom_keywords'
	| 'lom_languages'
	| 'lom_typicalagerange'
	| 'organisation'
	| 'publish_at'
	| 'published_at'
	| 'series'
	| 'title'
	| 'type'
	| 'updated_at'
	| 'views'
	| 'actions';

export interface ItemsTableState extends FilterableTableState {
	depublish_at: string;
	description: string;
	duration: string;
	expiry_date: string;
	external_id: string;
	uid: string;
	is_deleted: boolean;
	is_published: boolean;
	issued: string;
	lom_classification: string[];
	lom_context: string[];
	lom_intendedenduserrole: string[];
	lom_keywords: string[];
	lom_languages: string[];
	lom_typicalagerange: string[];
	organisation: string;
	publish_at: string;
	published_at: string;
	series: string;
	title: string;
	type: string;
	updated_at: string;
	views: number;
}

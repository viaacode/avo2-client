import { FilterableTableState } from '../shared/components/FilterTable/FilterTable';

export type CollectionsOrBundlesOverviewTableCols =
	| 'title'
	| 'author_first_name'
	| 'author_last_name'
	| 'author_role'
	| 'created_at'
	| 'updated_at'
	| 'is_public'
	| 'labels'
	| 'views'
	| 'bookmarks'
	| 'in_bundles'
	| 'subjects'
	| 'education_levels'
	| 'actions';

export interface CollectionsOrBundlesTableState extends FilterableTableState {
	title: string;
	author_first_name: string;
	author_last_name: string;
	author_role: string;
	created_at: string;
	updated_at: string;
	is_public: boolean;
	labels: string[];
	views: number;
	bookmarks: boolean;
	in_bundles: boolean;
	subjects: string[];
	education_levels: string[];
}

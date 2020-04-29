import { FilterableTableState } from '../shared/components/FilterTable/FilterTable';

export type CollectionsOrBundlesOverviewTableCols =
	| 'title'
	| 'author'
	| 'author_role'
	| 'last_updated_by_profile'
	| 'created_at'
	| 'updated_at'
	| 'is_public'
	| 'labels'
	| 'views'
	| 'bookmarks'
	| 'in_bundles'
	| 'subjects'
	| 'education_levels'
	| 'collection_labels'
	| 'actions';

export interface CollectionsOrBundlesTableState extends FilterableTableState {
	title: string;
	author: string;
	author_role: string;
	last_updated_by_profile: string;
	created_at: string;
	updated_at: string;
	is_public: boolean;
	labels: string[];
	views: number;
	bookmarks: boolean;
	in_bundles: boolean;
	subjects: string[];
	education_levels: string[];
	collection_labels: string[];
}

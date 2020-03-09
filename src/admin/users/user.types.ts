import { FilterableTableState } from '../shared/components/FilterTable/FilterTable';

export type UserOverviewTableCols =
	| 'first_name'
	| 'last_name'
	| 'mail'
	| 'stamboek'
	| 'created_at'
	| 'actions';

export interface UserTableState extends FilterableTableState {
	first_name: string;
	last_name: string;
	mail: string;
	stamboek: string;
	created_at: string;
}

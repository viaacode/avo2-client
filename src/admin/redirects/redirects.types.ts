import { type FilterableTableState } from '@meemoo/admin-core-ui/dist/admin.mjs';

import { type ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';

export type RedirectsOverviewTableCols =
	| 'old_path'
	| 'new_path'
	| 'created_at'
	| 'updated_at'
	| 'type'
	| typeof ACTIONS_TABLE_COLUMN_ID;

export interface RedirectsEditFormErrorState {
	old_path?: string;
	new_path?: string;
}

export interface RedirectsTableState extends FilterableTableState {
	old_path: string;
	new_path: string;
	created_at: string;
	updated_at: string;
	type: string;
}

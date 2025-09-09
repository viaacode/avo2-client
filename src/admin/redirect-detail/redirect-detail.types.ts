import type { Avo } from '@viaa/avo2-types';

import type { DateRange } from '../../shared/components/DateRangeDropdown/DateRangeDropdown';
import { type ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';

export enum RedirectDetailType {
	MARCOM = 'MARCOM',
	TECHNICAL = 'TECHNICAL',
}

export type RedirectDetailOverviewTableCols =
	| 'oldPath'
	| 'newPath'
	| 'createdAt'
	| 'updatedAt'
	| 'type'
	| typeof ACTIONS_TABLE_COLUMN_ID;

export interface RedirectDetailEditFormErrorState {
	old_path?: string;
	new_path?: string;
	type?: RedirectDetailType;
}

export type RedirectDetail = {
	id: number;
	oldPath: string;
	newPath: string;
	createdAt: string;
	updatedAt: string;
	type: RedirectDetailType;
};

export interface RedirectDetailFilters {
	query?: string;
	sortColumn?: string;
	sortOrder?: Avo.Search.OrderDirection;
	limit: number;
	offset: number;
	created_at?: DateRange;
	updated_at?: DateRange;
}

export interface RedirectDetailOverviewFilterState {
	columns: any[];
	page: number;
	query?: string;
	sort_column?: string;
	sort_order?: Avo.Search.OrderDirection;
	created_at?: DateRange;
	updated_at?: DateRange;
}

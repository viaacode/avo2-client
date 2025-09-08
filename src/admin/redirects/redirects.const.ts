import { type FilterableColumn, TableFilterType } from '@meemoo/admin-core-ui/dist/admin.mjs';

import { ROUTE_PARTS } from '../../shared/constants';
import { ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';
import { tText } from '../../shared/helpers/translate-text';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';

import { type RedirectsOverviewTableCols } from './redirects.types';

export const REDIRECT_PATH = {
	REDIRECT_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.redirects}`,
	REDIRECT_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.redirects}/${ROUTE_PARTS.create}`,
	REDIRECT_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.redirects}/:id/${ROUTE_PARTS.edit}`,
	REDIRECT_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.redirects}/:id/${ROUTE_PARTS.detail}`,
};

export const ITEMS_PER_PAGE = 10;

export const GET_REDIRECT_OVERVIEW_TABLE_COLS: () => FilterableColumn<RedirectsOverviewTableCols>[] =
	() => [
		{
			id: 'old_path',
			label: tText('Oude url'),
			sortable: true,
			visibleByDefault: true,
			dataType: TableColumnDataType.string,
		},
		{
			id: 'new_path',
			label: tText('Nieuwe url'),
			sortable: true,
			visibleByDefault: true,
			dataType: TableColumnDataType.string,
		},
		{
			id: 'created_at',
			label: tText('Aangemaakt op'),
			sortable: true,
			visibleByDefault: true,
			filterType: TableFilterType.DateRangeDropdown,
			dataType: TableColumnDataType.dateTime,
		},
		{
			id: 'updated_at',
			label: tText('Aangepast op'),
			sortable: true,
			visibleByDefault: true,
			filterType: TableFilterType.DateRangeDropdown,
			dataType: TableColumnDataType.dateTime,
		},
		{
			id: 'type',
			label: tText('Type'),
			sortable: true,
			visibleByDefault: true,
			dataType: TableColumnDataType.string,
		},
		{
			id: ACTIONS_TABLE_COLUMN_ID,
			tooltip: tText('Acties'),
			visibleByDefault: true,
		},
	];

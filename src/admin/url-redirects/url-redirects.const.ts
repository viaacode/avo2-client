import { type FilterableColumn, TableFilterType } from '@meemoo/admin-core-ui/dist/admin.mjs';

import type { CheckboxDropdownModalProps } from '../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import { ROUTE_PARTS } from '../../shared/constants';
import { ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';
import { tText } from '../../shared/helpers/translate-text';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';

import {
	type UrlRedirect,
	type UrlRedirectOverviewTableCols,
	UrlRedirectPathPattern,
} from './url-redirects.types';

export const URL_REDIRECT_PATH = {
	URL_REDIRECT_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.redirects}`,
	URL_REDIRECT_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.redirects}/${ROUTE_PARTS.create}`,
	URL_REDIRECT_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.redirects}/:id/${ROUTE_PARTS.edit}`,
};

export const ITEMS_PER_PAGE = 10;

export const GET_URL_REDIRECT_OVERVIEW_TABLE_COLS: () => FilterableColumn<UrlRedirectOverviewTableCols>[] =
	() => [
		{
			id: 'oldPathPattern',
			label: tText('Oude url patroon'),
			sortable: true,
			visibleByDefault: true,
			filterType: TableFilterType.CheckboxDropdownModal,
			filterProps: {
				options: URL_REDIRECT_PATTERN_OPTIONS(),
			} as unknown as CheckboxDropdownModalProps,
			dataType: TableColumnDataType.string,
		},
		{
			id: 'oldPath',
			label: tText('Oude url'),
			sortable: true,
			visibleByDefault: true,
			dataType: TableColumnDataType.string,
		},
		{
			id: 'newPath',
			label: tText('Nieuwe url'),
			sortable: true,
			visibleByDefault: true,
			dataType: TableColumnDataType.string,
		},
		{
			id: 'createdAt',
			label: tText('Aangemaakt op'),
			sortable: true,
			visibleByDefault: true,
			filterType: TableFilterType.DateRangeDropdown,
			dataType: TableColumnDataType.dateTime,
		},
		{
			id: 'updatedAt',
			label: tText('Aangepast op'),
			sortable: true,
			visibleByDefault: true,
			filterType: TableFilterType.DateRangeDropdown,
			dataType: TableColumnDataType.dateTime,
		},
		{
			id: ACTIONS_TABLE_COLUMN_ID,
			tooltip: tText('Acties'),
			visibleByDefault: true,
		},
	];

export const URL_REDIRECT_PATTERN_OPTIONS = () => [
	{
		id: String(UrlRedirectPathPattern.PLAIN_TEXT),
		value: UrlRedirectPathPattern.PLAIN_TEXT,
		label: tText('Tekst'),
	},
	{
		id: String(UrlRedirectPathPattern.REGEX),
		value: UrlRedirectPathPattern.REGEX,
		label: tText('Reguliere expressie'),
	},
];

export const INITIAL_URL_REDIRECT = () =>
	({
		oldPath: '/',
		newPath: '/',
		oldPathPattern: UrlRedirectPathPattern.PLAIN_TEXT,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}) as UrlRedirect;

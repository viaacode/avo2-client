import { Avo } from '@viaa/avo2-types';

import { CheckboxOption } from '../../shared/components';
import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';
import { FilterableColumn } from '../shared/components/FilterTable/FilterTable';

import { ItemsOverviewTableCols } from './items.types';

export const ITEMS_PATH = {
	ITEMS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.items}`,
	ITEM_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.items}/:id`,
};

export const ITEMS_PER_PAGE = 10;

export const TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<
	{
		[columnId in ItemsOverviewTableCols]: (order: Avo.Search.OrderDirection) => any;
	}
> = {
	organisation: (order: Avo.Search.OrderDirection) => ({ organisation: { name: order } }),
	type: (order: Avo.Search.OrderDirection) => ({ type: { label: order } }),
	views: (order: Avo.Search.OrderDirection) => ({
		view_counts_aggregate: { sum: { count: order } },
	}),
};

export const GET_ITEM_OVERVIEW_TABLE_COLS: (
	seriesOptions: CheckboxOption[],
	cpOptions: CheckboxOption[]
) => FilterableColumn[] = (seriesOptions: CheckboxOption[], cpOptions: CheckboxOption[]) => [
	{ id: 'external_id', label: i18n.t('admin/items/items___pid'), sortable: true },
	{ id: 'title', label: i18n.t('admin/items/items___titel'), sortable: true },
	{
		id: 'series',
		label: i18n.t('admin/items/items___reeks'),
		sortable: true,
		filterType: 'CheckboxDropdownModal',
		filterProps: {
			options: seriesOptions,
		},
	},
	{
		id: 'issued',
		label: i18n.t('admin/items/items___uitgegeven'),
		sortable: true,
		filterType: 'DateRangeDropdown',
	},
	{
		id: 'published_at',
		label: i18n.t('admin/items/items___published'),
		sortable: true,
		filterType: 'DateRangeDropdown',
	},
	{
		id: 'type',
		label: i18n.t('admin/items/items___type'),
		sortable: true,
		filterType: 'CheckboxDropdownModal',
		filterProps: {
			options: [
				{ label: i18n.t('admin/items/items___video'), id: 'video' },
				{ label: i18n.t('admin/items/items___audio'), id: 'audio' },
			] as CheckboxOption[],
		},
	},
	{
		id: 'organisation',
		label: i18n.t('admin/items/items___cp'),
		sortable: true,
		filterType: 'CheckboxDropdownModal',
		filterProps: {
			options: cpOptions,
		},
	},
	{ id: 'views', label: i18n.t('admin/items/items___views'), sortable: true },
	{
		id: 'is_published',
		label: i18n.t('admin/items/items___publiek'),
		sortable: true,
		filterType: 'BooleanCheckboxDropdown',
	},
	// {
	// 	id: 'updated_at',
	// 	label: i18n.t('admin/items/items___aangepast-op'),
	// 	sortable: true,
	// 	filterType: 'DateRangeDropdown',
	// },
	// {
	// 	id: 'publish_at',
	// 	label: i18n.t('admin/items/items___publish-at'),
	// 	sortable: true,
	// 	filterType: 'DateRangeDropdown',
	// },
	// {
	// 	id: 'depublish_at',
	// 	label: i18n.t('admin/items/items___depubliceren-op'),
	// 	sortable: true,
	// 	filterType: 'DateRangeDropdown',
	// },
	// { id: 'description', label: i18n.t('admin/items/items___beschrijving'), sortable: true },
	// { id: 'duration', label: i18n.t('admin/items/items___duur'), sortable: true },
	// {
	// 	id: 'expiry_date',
	// 	label: i18n.t('admin/items/items___expiratie-op'),
	// 	sortable: true,
	// 	filterType: 'DateRangeDropdown',
	// },
	// { id: 'uid', label: i18n.t('admin/items/items___id'), sortable: true },
	// {
	// 	id: 'is_deleted',
	// 	label: i18n.t('admin/items/items___verwijdert'),
	// 	sortable: true,
	// 	filterType: 'BooleanCheckboxDropdown',
	// },
	// { id: 'lom_classification', label: i18n.t('admin/items/items___vakken') },
	// { id: 'lom_context', label: i18n.t('admin/items/items___opleidingsniveau') },
	// { id: 'lom_intendedenduserrole', label: i18n.t('admin/items/items___bedoelde-rol'), sortable: true },
	// { id: 'lom_keywords', label: i18n.t('admin/items/items___terfwoorden') },
	// { id: 'lom_languages', label: i18n.t('admin/items/items___talen') },
	// { id: 'lom_typicalagerange', label: i18n.t('admin/items/items___leeftijdsgroep') },
	{ id: 'actions', label: '' },
];

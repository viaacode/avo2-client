import { Avo } from '@viaa/avo2-types';
import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';
import { FilterableColumn } from '../shared/components/FilterTable/FilterTable';
import { ItemsOverviewTableCols } from './items.types';
import { CheckboxOption } from '../../shared/components';

export const ITEMS_PATH = {
	ITEMS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.items}`,
};

export const ITEMS_PER_PAGE = 10;

export const TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<
	{
		[columnId in ItemsOverviewTableCols]: (order: Avo.Search.OrderDirection) => any;
	}
> = {
	organisation: (order: Avo.Search.OrderDirection) => ({ organisation: { name: order } }),
	type: (order: Avo.Search.OrderDirection) => ({ type: { label: order } }),
	views: (order: Avo.Search.OrderDirection) => ({ view_counts_aggregate: { count: order } }),
};

export const ITEM_OVERVIEW_TABLE_COLS: FilterableColumn[] = [
	{ id: 'external_id', label: i18n.t('Pid'), sortable: true },
	{ id: 'title', label: i18n.t('Titel'), sortable: true },
	{ id: 'series', label: i18n.t('Reeks'), sortable: true },
	{
		id: 'issued',
		label: i18n.t('Uitgegeven'),
		sortable: true,
		filterType: 'DateRangeDropdown',
	},
	{
		id: 'published_at',
		label: i18n.t('Published'),
		sortable: true,
		filterType: 'DateRangeDropdown',
	},
	{
		id: 'created_at',
		label: i18n.t('Aangemaakt'),
		sortable: true,
		filterType: 'DateRangeDropdown',
	},
	{
		id: 'type',
		label: i18n.t('Type'),
		sortable: true,
		filterType: 'CheckboxDropdownModal',
		filterProps: {
			options: [
				{ label: i18n.t('Video'), id: 'video' },
				{ label: i18n.t('Audio'), id: 'audio' },
			] as CheckboxOption[],
		},
	},
	{ id: 'organisation', label: i18n.t('CP'), sortable: true },
	{ id: 'views', label: i18n.t('Views'), sortable: true },
	{
		id: 'is_published',
		label: i18n.t('Publiek'),
		sortable: true,
		filterType: 'BooleanCheckboxDropdown',
	},
	// {
	// 	id: 'updated_at',
	// 	label: i18n.t('Aangepast op'),
	// 	sortable: true,
	// 	filterType: 'DateRangeDropdown',
	// },
	// {
	// 	id: 'publish_at',
	// 	label: i18n.t('Publish at'),
	// 	sortable: true,
	// 	filterType: 'DateRangeDropdown',
	// },
	// {
	// 	id: 'depublish_at',
	// 	label: i18n.t('Depubliceren op'),
	// 	sortable: true,
	// 	filterType: 'DateRangeDropdown',
	// },
	// { id: 'description', label: i18n.t('Beschrijving'), sortable: true },
	// { id: 'duration', label: i18n.t('Duur'), sortable: true },
	// {
	// 	id: 'expiry_date',
	// 	label: i18n.t('Expiratie op'),
	// 	sortable: true,
	// 	filterType: 'DateRangeDropdown',
	// },
	// { id: 'uid', label: i18n.t('id'), sortable: true },
	// {
	// 	id: 'is_deleted',
	// 	label: i18n.t('Verwijdert'),
	// 	sortable: true,
	// 	filterType: 'BooleanCheckboxDropdown',
	// },
	// { id: 'lom_classification', label: i18n.t('Vakken') },
	// { id: 'lom_context', label: i18n.t('Opleidingsniveau') },
	// { id: 'lom_intendedenduserrole', label: i18n.t('Bedoelde rol'), sortable: true },
	// { id: 'lom_keywords', label: i18n.t('Terfwoorden') },
	// { id: 'lom_languages', label: i18n.t('Talen') },
	// { id: 'lom_typicalagerange', label: i18n.t('Leeftijdsgroep') },
	{ id: 'actions', label: '' },
];

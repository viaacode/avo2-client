import { Avo } from '@viaa/avo2-types';
import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';
import { FilterableColumn } from '../shared/components/FilterTable/FilterTable';
import { CollectionsOrBundlesOverviewTableCols } from './collections-or-bundles.types';

export const COLLECTIONS_OR_BUNDLES_PATH = {
	COLLECTIONS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.collections}`,
	BUNDLES_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.bundles}`,
};

export const ITEMS_PER_PAGE = 10;

export const TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<
	{
		[columnId in CollectionsOrBundlesOverviewTableCols]: (
			order: Avo.Search.OrderDirection
		) => any;
	}
> = {
	author_first_name: (order: Avo.Search.OrderDirection) => ({
		profile: { usersByuserId: { first_name: order } },
	}),
	author_last_name: (order: Avo.Search.OrderDirection) => ({
		profile: { usersByuserId: { first_name: order } },
	}),
	author_role: (order: Avo.Search.OrderDirection) => ({
		profile: { usersByuserId: { first_name: order } },
	}),
	views: (order: Avo.Search.OrderDirection) => ({ view_counts_aggregate: { count: order } }),
};

export const GET_USER_OVERVIEW_TABLE_COLS: () => FilterableColumn[] = () => [
	{
		id: 'title',
		label: i18n.t('admin/collections-or-bundles/collections-or-bundles___title'),
		sortable: true,
	},
	{
		id: 'author_first_name',
		label: i18n.t('admin/collections-or-bundles/collections-or-bundles___auteur-voornaam'),
		sortable: true,
	},
	{
		id: 'author_last_name',
		label: i18n.t('admin/collections-or-bundles/collections-or-bundles___auteur-achternaam'),
		sortable: true,
	},
	{
		id: 'created_at',
		label: i18n.t('admin/collections-or-bundles/collections-or-bundles___aangemaakt-op'),
		sortable: true,
		filterType: 'DateRangeDropdown',
		filterProps: {},
	},
	{
		id: 'updated_at',
		label: i18n.t('admin/collections-or-bundles/collections-or-bundles___aangepast-op'),
		sortable: true,
		filterType: 'DateRangeDropdown',
		filterProps: {},
	},
	{
		id: 'is_public',
		label: i18n.t('admin/collections-or-bundles/collections-or-bundles___publiek'),
		sortable: true,
		filterType: 'BooleanCheckboxDropdown',
	},
	{
		id: 'author_role',
		label: i18n.t('admin/collections-or-bundles/collections-or-bundles___auteur-rol'),
		sortable: true,
	},
	{
		id: 'views',
		label: i18n.t('admin/collections-or-bundles/collections-or-bundles___bekeken'),
		sortable: true,
	},
	// { id: 'bookmarks', label: i18n.t('admin/collections-or-bundles/collections-or-bundles___gebookmarkt'), sortable: true },
	// { id: 'in_bundles', label: i18n.t('admin/collections-or-bundles/collections-or-bundles___in-bundel'), sortable: true },
	// { id: 'subjects', label: i18n.t('admin/collections-or-bundles/collections-or-bundles___vakken'), sortable: true },
	// { id: 'education_levels', label: i18n.t('admin/collections-or-bundles/collections-or-bundles___opleidingsniveaus'), sortable: true },
	// { id: 'labels', label: i18n.t('admin/collections-or-bundles/collections-or-bundles___labels'), sortable: true },
	{ id: 'actions', label: '' },
];

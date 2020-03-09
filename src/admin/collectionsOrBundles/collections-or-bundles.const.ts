import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';
import { FilterableColumn } from '../shared/components/FilterTable/FilterTable';

export const COLLECTIONS_OR_BUNDLES_PATH = {
	COLLECTIONS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.collections}`,
	BUNDLES_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.bundles}`,
};

export const ITEMS_PER_PAGE = 10;

export const USER_OVERVIEW_TABLE_COLS: FilterableColumn[] = [
	{ id: 'title', label: i18n.t('Title'), sortable: true },
	{ id: 'author_first_name', label: i18n.t('Auteur voornaam'), sortable: true },
	{ id: 'author_last_name', label: i18n.t('Auteur achternaam'), sortable: true },
	{
		id: 'created_at',
		label: i18n.t('Aangemaakt op'),
		sortable: true,
		filterType: 'DateRangeDropdown',
		filterProps: {},
	},
	{
		id: 'updated_at',
		label: i18n.t('Aangepast op'),
		sortable: true,
		filterType: 'DateRangeDropdown',
		filterProps: {},
	},
	{ id: 'is_public', label: i18n.t('Publiek'), sortable: true },
	{ id: 'author_role', label: i18n.t('Auteur rol'), sortable: true },
	{ id: 'views', label: i18n.t('Bekeken'), sortable: true },
	// { id: 'bookmarks', label: i18n.t('Gebookmarkt'), sortable: true },
	// { id: 'in_bundles', label: i18n.t('In Bundel'), sortable: true },
	// { id: 'subjects', label: i18n.t('Vakken'), sortable: true },
	// { id: 'education_levels', label: i18n.t('Opleidingsniveaus'), sortable: true },
	// { id: 'labels', label: i18n.t('Labels'), sortable: true },
	{ id: 'actions', label: '' },
];

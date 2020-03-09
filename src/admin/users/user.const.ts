import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';
import { FilterableColumn } from '../shared/components/FilterTable/FilterTable';

export const USER_PATH = {
	USER: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.user}`,
	USER_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.user}/:id`,
};

export const ITEMS_PER_PAGE = 10;

export const USER_OVERVIEW_TABLE_COLS: FilterableColumn[] = [
	{ id: 'first_name', label: i18n.t('Voornaam'), sortable: true },
	{ id: 'last_name', label: i18n.t('Achternaam'), sortable: true },
	{ id: 'mail', label: i18n.t('Email'), sortable: true },
	{ id: 'stamboek', label: i18n.t('Stamboek'), sortable: true },
	{
		id: 'created_at',
		label: i18n.t('Aangemaakt op'),
		sortable: true,
		filterType: 'DateRangeDropdown',
		filterProps: {
			id: 'created_at',
			label: i18n.t('Aangemaakt op'),
		},
	},
	{ id: 'actions', label: '' },
];

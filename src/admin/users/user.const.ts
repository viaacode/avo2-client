import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';
import { FilterableColumn } from '../shared/components/FilterTable/FilterTable';

export const USER_PATH = {
	USER: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.user}`,
	USER_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.user}/:id`,
};

export const ITEMS_PER_PAGE = 10;

export const GET_USER_OVERVIEW_TABLE_COLS: () => FilterableColumn[] = () => [
	{ id: 'first_name', label: i18n.t('admin/users/user___voornaam'), sortable: true },
	{ id: 'last_name', label: i18n.t('admin/users/user___achternaam'), sortable: true },
	{ id: 'mail', label: i18n.t('admin/users/user___email'), sortable: true },
	{ id: 'stamboek', label: i18n.t('admin/users/user___stamboek'), sortable: true },
	{
		id: 'created_at',
		label: i18n.t('admin/users/user___aangemaakt-op'),
		sortable: true,
		filterType: 'DateRangeDropdown',
	},
	{ id: 'actions', label: '' },
];

import { TableColumn } from '@viaa/avo2-components';

import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';
import { FilterableColumn } from '../shared/components/FilterTable/FilterTable';

export const USER_GROUP_PATH = {
	USER_GROUP_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.userGroup}`,
	USER_GROUP_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.userGroup}/:id`,
	USER_GROUP_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.userGroup}/${ROUTE_PARTS.create}`,
	USER_GROUP_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.userGroup}/:id/${ROUTE_PARTS.edit}`,
};

export const ITEMS_PER_PAGE = 10;

export const USER_GROUP_OVERVIEW_TABLE_COLS: FilterableColumn[] = [
	{ id: 'label', label: i18n.t('Label'), sortable: true },
	{ id: 'description', label: i18n.t('Beschrijving'), sortable: true },
	{
		id: 'created_at',
		label: i18n.t('Aangemaakt op'),
		sortable: true,
		filterType: 'DateRangeDropdown',
	},
	{
		id: 'updated_at',
		label: i18n.t('Aangepast op'),
		sortable: true,
		filterType: 'DateRangeDropdown',
	},
	{ id: 'actions', label: '' },
];

export const PERMISSION_GROUP_TABLE_COLS: TableColumn[] = [
	{ id: 'label', label: i18n.t('Label'), sortable: true },
	{ id: 'description', label: i18n.t('Beschrijving'), sortable: true },
	{ id: 'created_at', label: i18n.t('Aangemaakt op'), sortable: true },
	{ id: 'updated_at', label: i18n.t('Aangepast op'), sortable: true },
	{ id: 'actions', label: '' },
];

import { TableColumn } from '@viaa/avo2-components';

import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';

export const PERMISSION_GROUP_PATH = {
	PERMISSION_GROUP_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.permissionGroups}`,
	PERMISSION_GROUP_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.permissionGroups}/:id`,
	PERMISSION_GROUP_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.permissionGroups}/${ROUTE_PARTS.create}`,
	PERMISSION_GROUP_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.permissionGroups}/:id/${ROUTE_PARTS.edit}`,
};

export const ITEMS_PER_PAGE = 10;

export const PERMISSION_GROUP_OVERVIEW_TABLE_COLS: TableColumn[] = [
	{ id: 'label', label: i18n.t('naam'), sortable: true },
	{ id: 'description', label: i18n.t('beschrijving'), sortable: true },
	{ id: 'created_at', label: i18n.t('gemaakt op'), sortable: true },
	{ id: 'updated_at', label: i18n.t('aangepast op'), sortable: true },
	{ id: 'actions', label: '' },
];

export const PERMISSIONS_TABLE_COLS: TableColumn[] = [
	{ id: 'label', label: i18n.t('Permissie Code'), sortable: true },
	{ id: 'description', label: i18n.t('Permissie beschrijving'), sortable: true },
	{ id: 'actions', label: '' },
];

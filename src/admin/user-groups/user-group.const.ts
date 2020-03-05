import { TableColumn } from '@viaa/avo2-components';

import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';

export const USER_GROUP_PATH = {
	USER_GROUP_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.userGroup}`,
	USER_GROUP_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.userGroup}/:id`,
	USER_GROUP_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.userGroup}/:id/${ROUTE_PARTS.create}`,
	USER_GROUP_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.userGroup}/:id/${ROUTE_PARTS.edit}`,
};

export const USER_GROUP_OVERVIEW_TABLE_COLS: TableColumn[] = [
	{ id: 'label', label: i18n.t('Label') },
	{ id: 'description', label: i18n.t('Beschrijving') },
	{ id: 'created_at', label: i18n.t('Aangemaakt op') },
	{ id: 'updated_at', label: i18n.t('Aangepast op') },
	{ id: 'actions', label: '' },
];

export const PERMISSION_GROUP_TABLE_COLS: TableColumn[] = [
	{ id: 'label', label: i18n.t('Label') },
	{ id: 'description', label: i18n.t('Beschrijving') },
	{ id: 'created_at', label: i18n.t('Aangemaakt op') },
	{ id: 'updated_at', label: i18n.t('Aangepast op') },
	{ id: 'actions', label: '' },
];

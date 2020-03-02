import { TableColumn } from '@viaa/avo2-components';

import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';

export const USER_PATH = {
	USER: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.user}`,
	USER_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.user}/:user`,
};

export const USER_OVERVIEW_TABLE_COLS: TableColumn[] = [
	{ id: 'name', label: i18n.t('Naam') },
	{ id: 'email', label: i18n.t('Email') },
	{ id: 'actions', label: '' },
];

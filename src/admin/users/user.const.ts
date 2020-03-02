import { TableColumn } from '@viaa/avo2-components';

import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';

export const USER_PATH = {
	USER: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.user}`,
	USER_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.user}/:id`,
};

export const USER_OVERVIEW_TABLE_COLS: TableColumn[] = [
	{ id: 'first_name', label: i18n.t('Voornaam') },
	{ id: 'last_name', label: i18n.t('Achternaam') },
	{ id: 'mail', label: i18n.t('Email') },
	{ id: 'stamboek', label: i18n.t('Stamboek') },
	{ id: 'created_at', label: i18n.t('Aangemaakt op') },
	{ id: 'actions', label: '' },
];

import { TableColumn } from '@viaa/avo2-components';

import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';

import { UserEditFormState } from './user.types';

export const USER_PATH = {
	USER: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.user}`,
	USER_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.user}/${ROUTE_PARTS.create}`,
	USER_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.user}/:user`,
	USER_ITEM_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.user}/:user/${ROUTE_PARTS.create}`,
	USER_ITEM_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.user}/:user/:id/${ROUTE_PARTS.edit}`,
};

export const USER_OVERVIEW_TABLE_COLS: TableColumn[] = [
	{ id: 'name', label: i18n.t('Naam') },
	{ id: 'actions', label: '' },
];

export const INITIAL_USER_FORM = (placement: string = ''): UserEditFormState => ({
	placement,
	description: '',
	icon: '',
	label: '',
	content_type: null,
	content_path: null,
	link_target: '_self',
	user_group_ids: [],
});

export const PAGE_TYPES_LANG = {
	create: i18n.t('admin/user/user___toevoegen'),
	edit: i18n.t('admin/user/user___aanpassen'),
};

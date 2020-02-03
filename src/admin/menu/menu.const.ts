import { TableColumn } from '@viaa/avo2-components';

import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';

import { MenuEditFormState } from './menu.types';

export const MENU_PATH = {
	MENU: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.menu}`,
	MENU_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.menu}/${ROUTE_PARTS.create}`,
	MENU_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.menu}/:menu`,
	MENU_ITEM_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.menu}/:menu/${ROUTE_PARTS.create}`,
	MENU_ITEM_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.menu}/:menu/:id/${ROUTE_PARTS.edit}`,
};

export const MENU_OVERVIEW_TABLE_COLS: TableColumn[] = [
	{ id: 'placement', label: i18n.t('admin/menu/menu___naam') },
	{ id: 'description', label: i18n.t('admin/menu/menu___omschrijving') },
	{ id: 'actions', label: '' },
];

export const INITIAL_MENU_FORM = (placement: string = ''): MenuEditFormState => ({
	placement,
	description: '',
	icon: '',
	label: '',
	content_type: 'COLLECTION',
	content_path: '',
	link_target: '_self',
	user_group_ids: [],
});

export const PAGE_TYPES_LANG = {
	create: i18n.t('admin/menu/menu___toevoegen'),
	edit: i18n.t('admin/menu/menu___aanpassen'),
};

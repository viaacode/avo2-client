import { OptionsType } from 'react-select';

import { IconName } from '@viaa/avo2-components';

import { ROUTE_PARTS } from '../../shared/constants';
import { ReactSelectOption, TableColumn } from '../../shared/types';

import { MenuEditForm } from './menu.types';

export const MENU_PATH = {
	MENU: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.menu}`,
	MENU_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.menu}/${ROUTE_PARTS.create}`,
	MENU_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.menu}/:menu`,
	MENU_ITEM_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.menu}/:menu/${ROUTE_PARTS.create}`,
	MENU_ITEM_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.menu}/:menu/:id/${ROUTE_PARTS.edit}`,
};

export const MENU_OVERVIEW_TABLE_COLS: TableColumn[] = [
	{ id: 'placement', label: 'Naam' },
	{ id: 'description', label: 'Omschrijving' },
	{ id: 'actions', label: '' },
];

export const MENU_ICON_OPTIONS: OptionsType<ReactSelectOption<IconName>> = Object.freeze([
	{ label: 'Aktetas', value: 'briefcase' },
	{ label: 'Zoek', value: 'search' },
]);

export const INITIAL_MENU_FORM: MenuEditForm = {
	description: '',
	placement: '',
	icon: '',
	label: '',
	link: '',
};

export const PAGE_TYPES_LANG = {
	create: 'toevoegen',
	edit: 'aanpassen',
};

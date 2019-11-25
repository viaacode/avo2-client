import { OptionsType } from 'react-select';

import { IconName } from '@viaa/avo2-components';

import { ROUTE_PARTS } from '../shared/constants';
import { ReactSelectOption } from '../shared/types/types';

export const ADMIN_PATH = Object.freeze({
	DASHBOARD: `/${ROUTE_PARTS.admin}`,
	MENU: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.menu}`,
	MENU_DETAIL: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.menu}/:menu`,
	MENU_CREATE: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.menu}/:menu/${ROUTE_PARTS.create}`,
	MENU_EDIT: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.menu}/:menu/:id/${ROUTE_PARTS.edit}`,
});

export const MENU_OVERVIEW_TABLE_COLS = [
	{ id: 'placement', label: 'Naam' },
	{ id: 'description', label: 'Omschrijving' },
	{ id: 'actions', label: '' },
];

export const MENU_ICON_OPTIONS: OptionsType<ReactSelectOption<IconName>> = Object.freeze([
	{ label: 'Aktentas', value: 'briefcase' },
	{ label: 'Zoek', value: 'search' },
]);

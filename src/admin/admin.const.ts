import { RouteParts } from '../constants';

export const ADMIN_PATH = Object.freeze({
	DASHBOARD: `/${RouteParts.Admin}`,
	MENU: `/${RouteParts.Admin}/${RouteParts.Menu}`,
	MENU_DETAIL: `/${RouteParts.Admin}/${RouteParts.Menu}/:menu`,
	MENU_CREATE: `/${RouteParts.Admin}/${RouteParts.Menu}/:menu/${RouteParts.Create}`,
	MENU_EDIT: `/${RouteParts.Admin}/${RouteParts.Menu}/:menu/:id/${RouteParts.Edit}`,
});

export const MENU_OVERVIEW_TABLE_COLS = [
	{ id: 'placement', label: 'Naam' },
	{ id: 'description', label: 'Omschrijving' },
	{ id: 'actions', label: '' },
];

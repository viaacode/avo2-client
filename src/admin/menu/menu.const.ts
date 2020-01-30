import { IconName, TableColumn } from '@viaa/avo2-components';

import { ROUTE_PARTS } from '../../shared/constants';
import i18n from '../../shared/translations/i18n';
import { ReactSelectOption } from '../../shared/types';

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

export const MENU_ICON_OPTIONS: ReactSelectOption<IconName>[] = [
	{ label: i18n.t('Afbeelding'), value: 'image' },
	{ label: i18n.t('admin/menu/menu___aktetas'), value: 'briefcase' },
	{ label: i18n.t('Audio'), value: 'headphone' },
	{ label: i18n.t('Collectie'), value: 'collection' },
	{ label: i18n.t('Download'), value: 'download' },
	{ label: i18n.t('Externe link'), value: 'external-link' },
	{ label: i18n.t('Help'), value: 'help-circle' },
	{ label: i18n.t('Info'), value: 'info' },
	{ label: i18n.t('Kalender'), value: 'calendar' },
	{ label: i18n.t('Klascement'), value: 'klascement' },
	{ label: i18n.t('Link'), value: 'link-2' },
	{ label: i18n.t('Link delen'), value: 'share-2' },
	{ label: i18n.t('Login'), value: 'log-in' },
	{ label: i18n.t('Opdracht'), value: 'clipboard' },
	{ label: i18n.t('Profiel'), value: 'user' },
	{ label: i18n.t('Smartschool'), value: 'smartschool' },
	{ label: i18n.t('Tekstbestand'), value: 'file-text' },
	{ label: i18n.t('Uploaden'), value: 'upload' },
	{ label: i18n.t('Video'), value: 'video' },
	{ label: i18n.t('View'), value: 'eye' },
	{ label: i18n.t('admin/menu/menu___zoek'), value: 'search' },
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

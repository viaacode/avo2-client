import { OptionsType } from 'react-select';

import { IconName } from '@viaa/avo2-components';

import { ReactSelectOption } from '../shared/types/types';

export const MENU_OVERVIEW_TABLE_COLS = [
	{ id: 'placement', label: 'Naam' },
	{ id: 'description', label: 'Omschrijving' },
	{ id: 'actions', label: '' },
];

export const MENU_ICON_OPTIONS: OptionsType<ReactSelectOption<IconName>> = Object.freeze([
	{ label: 'Aktentas', value: 'briefcase' },
	{ label: 'Zoek', value: 'search' },
]);

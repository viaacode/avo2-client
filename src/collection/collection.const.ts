import { TabProps } from '@viaa/avo2-components';

import i18n from '../shared/translations/i18n';

export const GET_COLLECTION_EDIT_TABS = (): TabProps[] => [
	{
		id: 'inhoud',
		label: i18n.t('Inhoud'),
		icon: 'collection',
	},
	{
		id: 'metadata',
		label: i18n.t('Publicatiedetails'),
		icon: 'file-text',
	},
	{
		id: 'admin',
		label: i18n.t('Beheer'),
		icon: 'settings',
	},
];

export const STILL_DIMENSIONS = {
	width: 177,
	height: 100,
};

export const MAX_SEARCH_DESCRIPTION_LENGTH = 300;

export const NEW_FRAGMENT = {
	text: {
		id: null,
		collection_uuid: null,
		position: 1,
		external_id: '',
		custom_description: '',
		custom_title: '',
		end_oc: null,
		start_oc: null,
		use_custom_fields: true,
	},
};

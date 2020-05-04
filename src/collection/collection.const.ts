import { TabProps } from '@viaa/avo2-components';

import i18n from '../shared/translations/i18n';

export const GET_COLLECTION_EDIT_TABS = (): TabProps[] => [
	{
		id: 'inhoud',
		label: i18n.t('collection/collection___inhoud'),
		icon: 'collection',
	},
	{
		id: 'metadata',
		label: i18n.t('collection/collection___publicatiedetails'),
		icon: 'file-text',
	},
	{
		id: 'admin',
		label: i18n.t('collection/collection___beheer'),
		icon: 'settings',
	},
];

export const STILL_DIMENSIONS = {
	width: 177,
	height: 100,
};

export const MAX_TITLE_LENGTH = 110;
export const MAX_SEARCH_DESCRIPTION_LENGTH = 300;
export const MAX_LONG_DESCRIPTION_LENGTH = 1200;

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
		type: 'TEXT',
	},
};

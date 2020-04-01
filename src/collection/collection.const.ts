import { TabProps } from '@viaa/avo2-components';

export const COLLECTION_EDIT_TABS: TabProps[] = [
	{
		id: 'inhoud',
		label: 'Inhoud',
		icon: 'collection',
	},
	{
		id: 'metadata',
		label: 'Metadata',
		icon: 'file-text',
	},
	{
		id: 'admin',
		label: 'Beheer',
		icon: 'settings',
	},
];

export const STILL_DIMENSIONS = {
	width: 177,
	height: 100,
};

export const MAX_TITLE_LENGTH = 110;
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

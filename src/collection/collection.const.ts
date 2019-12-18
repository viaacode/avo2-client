import { TabProps } from '@viaa/avo2-components';

import { ROUTE_PARTS } from '../shared/constants';

export const COLLECTION_PATH = Object.freeze({
	COLLECTION_DETAIL: `/${ROUTE_PARTS.collections}/:id`,
	COLLECTION_EDIT: `/${ROUTE_PARTS.collections}/:id/${ROUTE_PARTS.edit}`,
});

// TODO: get these from the api once the database is filled up
export const USER_GROUPS: string[] = ['Docent', 'Leering', 'VIAA medewerker', 'Uitgever'];

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
];

export const STILL_DIMENSIONS = {
	width: 177,
	height: 100,
};

export const MAX_SEARCH_DESCRIPTION_LENGTH = 300;

export const NEW_FRAGMENT = {
	text: {
		id: null,
		collection_id: null,
		position: 1,
		external_id: '',
		custom_description: '',
		custom_title: '',
		end_oc: null,
		start_oc: null,
		use_custom_fields: true,
	},
};

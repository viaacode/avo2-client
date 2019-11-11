import { IconName } from '../shared/types/types';

// TODO: get these from the api once the database is filled up
export const USER_GROUPS: string[] = ['Docent', 'Leering', 'VIAA medewerker', 'Uitgever'];

export const COLLECTION_EDIT_TABS = [
	{
		id: 'inhoud',
		label: 'Inhoud',
		icon: 'collection' as IconName,
	},
	{
		id: 'metadata',
		label: 'Metadata',
		icon: 'file-text' as IconName,
	},
];

export const STILL_DIMENSIONS = {
	width: 177,
	height: 100,
};

export const MAX_SEARCH_DESCRIPTION_LENGTH = 300;

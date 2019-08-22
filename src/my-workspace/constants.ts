import { RouteParts } from '../routes';

export const COLLECTIONS_ID = RouteParts.Collections;
export const FOLDERS_ID = RouteParts.Folders;
export const BOOKMARKS_ID = RouteParts.Bookmarks;

export const TABS = [
	{
		label: 'Collecties',
		icon: 'collection',
		id: COLLECTIONS_ID,
	},
	{
		label: 'Mappen',
		icon: 'folder',
		id: FOLDERS_ID,
	},
	{
		label: 'Bladwijzers',
		icon: 'bookmark',
		id: BOOKMARKS_ID,
	},
];

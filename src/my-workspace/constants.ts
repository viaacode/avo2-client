import { RouteParts } from '../constants';

export const COLLECTIONS_ID = RouteParts.Collections;
export const FOLDERS_ID = RouteParts.Folders;
export const ASSIGNMENTS_ID = RouteParts.Assignments;
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
		label: 'Opdrachten',
		icon: 'clipboard',
		id: ASSIGNMENTS_ID,
	},
	{
		label: 'Bladwijzers',
		icon: 'bookmark',
		id: BOOKMARKS_ID,
	},
];

export const ITEMS_PER_PAGE = 20;

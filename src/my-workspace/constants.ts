import { RouteParts } from '../constants';
import { IconName } from '../shared/types/types';

export const COLLECTIONS_ID = RouteParts.Collections;
export const FOLDERS_ID = RouteParts.Folders;
export const ASSIGNMENTS_ID = RouteParts.Assignments;
export const BOOKMARKS_ID = RouteParts.Bookmarks;

export const TABS = [
	{
		label: 'Collecties',
		icon: 'collection' as IconName,
		id: COLLECTIONS_ID,
	},
	{
		label: 'Mappen',
		icon: 'folder' as IconName,
		id: FOLDERS_ID,
	},
	{
		label: 'Opdrachten',
		icon: 'clipboard' as IconName,
		id: ASSIGNMENTS_ID,
	},
	{
		label: 'Bladwijzers',
		icon: 'bookmark' as IconName,
		id: BOOKMARKS_ID,
	},
];

export const ITEMS_PER_PAGE = 20;

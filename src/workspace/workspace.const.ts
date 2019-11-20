import { ROUTE_PARTS } from '../shared/constants';
import { IconName } from '../shared/types/types';

export const WORKSPACE_PATH = Object.freeze({
	WORKSPACE: `/${ROUTE_PARTS.workspace}`,
	WORKSPACE_TAB: `/${ROUTE_PARTS.workspace}/:tabId`,
});

export const COLLECTIONS_ID = ROUTE_PARTS.collections;
export const FOLDERS_ID = ROUTE_PARTS.folders;
export const ASSIGNMENTS_ID = ROUTE_PARTS.assignments;
export const BOOKMARKS_ID = ROUTE_PARTS.bookmarks;

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

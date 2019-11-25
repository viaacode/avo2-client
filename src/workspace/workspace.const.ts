import { ROUTE_PARTS } from '../shared/constants';
import { Tab } from '../shared/types';

export const WORKSPACE_PATH = Object.freeze({
	WORKSPACE: `/${ROUTE_PARTS.workspace}`,
	WORKSPACE_TAB: `/${ROUTE_PARTS.workspace}/:tabId`,
});

export const COLLECTIONS_ID = ROUTE_PARTS.collections;
export const FOLDERS_ID = ROUTE_PARTS.folders;
export const ASSIGNMENTS_ID = ROUTE_PARTS.assignments;
export const BOOKMARKS_ID = ROUTE_PARTS.bookmarks;

export const TABS: Tab[] = [
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

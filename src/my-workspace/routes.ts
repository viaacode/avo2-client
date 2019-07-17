import { Bookmarks } from './views/Bookmarks';
import { Collections } from './views/Collections';
import { Favourites } from './views/Favourites';
import { Folders } from './views/Folders';

export const MY_WORKSPACE_ROUTES = [
	{
		path: '/mijn-werkruimte/collecties',
		exact: true,
		component: Collections,
	},
	{
		path: '/mijn-werkruimte/bladwijzers',
		exact: true,
		component: Bookmarks,
	},
];

import { Bookmarks } from './views/Bookmarks';
import { Collections } from './views/Collections';
import { Favourites } from './views/Favourites';
import { Folders } from './views/Folders';

export const MY_ARCHIVE_ROUTES = [
	{
		path: '/my-archive/collections',
		exact: true,
		component: Collections,
	},
	{
		path: '/my-archive/folder',
		exact: true,
		component: Folders,
	},
	{
		path: '/my-archive/bookmarks',
		exact: true,
		component: Bookmarks,
	},
	{
		path: '/my-archive/favourites',
		exact: true,
		component: Favourites,
	},
];

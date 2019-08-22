export const RouteParts = {
	Search: 'zoeken',
	Item: 'item',
	Folder: 'map',
	Collection: 'collectie',
	Collections: 'collecties',
	MyWorkspace: 'mijn-werkruimte',
	Bookmarks: 'bladwijzers',
	Folders: 'mappen',
	Login: 'aanmelden',
	Logout: 'afmelden',
	Register: 'registreren',
	Discover: 'ontdek',
	Projects: 'projecten',
	News: 'nieuws',
	Edit: 'bewerk',
};

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

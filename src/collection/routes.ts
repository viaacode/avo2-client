import Collection from './views/Collection';
import EditCollection from './views/EditCollection';

export const COLLECTION_ROUTES = [
	{
		path: '/collection/:id',
		exact: true,
		component: Collection,
	},
	{
		path: '/collection/:id/edit',
		exact: true,
		component: EditCollection,
	},
];

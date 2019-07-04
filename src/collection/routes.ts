import { Collection } from './views/Collection';

export const COLLECTION_ROUTES = [
	{
		path: '/collection/:id',
		exact: true,
		component: Collection,
	},
];

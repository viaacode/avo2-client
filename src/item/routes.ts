import { Item } from './views/Item';

export const ITEM_ROUTES = [
	{
		path: '/item/:id',
		exact: true,
		component: Item,
	},
];

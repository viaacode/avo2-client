import { COLLECTION_ROUTES } from './collection/routes';
import { HOME_ROUTES } from './home/routes';
import { ITEM_ROUTES } from './item/routes';
import { SEARCH_ROUTES } from './search/routes';

export const ROUTES: any[] = [
	...HOME_ROUTES,
	...SEARCH_ROUTES,
	...ITEM_ROUTES,
	...COLLECTION_ROUTES,
];

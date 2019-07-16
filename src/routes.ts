import { NOT_FOUND_ROUTES } from './404/routes';
import { COLLECTION_ROUTES } from './collection/routes';
import { ITEM_ROUTES } from './item/routes';
import { SEARCH_ROUTES } from './search/routes';

export const ROUTES: any[] = [
	...SEARCH_ROUTES,
	...ITEM_ROUTES,
	...COLLECTION_ROUTES,
	...NOT_FOUND_ROUTES,
];

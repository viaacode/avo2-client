import { COLLECTION_ROUTES } from './collection/routes';
import { ITEM_ROUTES } from './item/routes';
import { MY_ARCHIVE_ROUTES } from './my-archive/routes';
import { SEARCH_ROUTES } from './search/routes';

export const ROUTES: any[] = [
	...SEARCH_ROUTES,
	...ITEM_ROUTES,
	...COLLECTION_ROUTES,
	...MY_ARCHIVE_ROUTES,
];

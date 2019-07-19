import { RouteProps } from 'react-router-dom';

import { NOT_FOUND_ROUTES } from './404/routes';
import { COLLECTION_ROUTES } from './collection/routes';
import { HOME_ROUTES } from './home/routes';
import { ITEM_ROUTES } from './item/routes';
import { MY_WORKSPACE_ROUTES } from './my-workspace/routes';
import { SEARCH_ROUTES } from './search/routes';

export const ROUTES: RouteProps[] = [
	...HOME_ROUTES,
	...ITEM_ROUTES,
	...SEARCH_ROUTES,
	...COLLECTION_ROUTES,
	...MY_WORKSPACE_ROUTES,
	...NOT_FOUND_ROUTES,
];

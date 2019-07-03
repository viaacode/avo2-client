import { RouteConfig } from 'react-router-config';

import { DETAIL_ROUTES } from './detail/routes';
import { SEARCH_ROUTES } from './search/routes';

export const ROUTES: RouteConfig[] = [...SEARCH_ROUTES, ...DETAIL_ROUTES];

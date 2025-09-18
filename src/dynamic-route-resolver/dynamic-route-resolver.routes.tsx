import React, { type ReactNode } from 'react';
import { Route } from 'react-router';

import { APP_PATH } from '../constants';

import DynamicRouteResolver from './views/DynamicRouteResolver';

export const renderDynamicRouteResolverRoutes = (): ReactNode[] => [
	<Route
		Component={DynamicRouteResolver}
		path={APP_PATH.ALL_ROUTES.route}
		key={APP_PATH.ALL_ROUTES.route}
	/>,
];

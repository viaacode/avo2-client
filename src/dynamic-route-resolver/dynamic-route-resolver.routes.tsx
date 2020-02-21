import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { DYNAMIC_ROUTE_RESOLVER_PATH } from './dynamic-route-resolver.const';
import DynamicRouteResolver from './views/DynamicRouteResolver';

export const renderDynamicRouteResolverRoutes = (): ReactNode[] => [
	<Route
		component={DynamicRouteResolver}
		path={DYNAMIC_ROUTE_RESOLVER_PATH.ALL_ROUTES}
		key={DYNAMIC_ROUTE_RESOLVER_PATH.ALL_ROUTES}
	/>,
];

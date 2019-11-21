import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { RouteParts } from '../constants';
import { Discover } from './views';

export const renderDiscoverRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={Discover}
		path={`/${RouteParts.Discover}`}
		key={`/${RouteParts.Discover}`}
		exact
	/>,
];

import React, { ReactNode } from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { RouteParts } from '../constants';
import Search from './views/Search';

export const renderSearchRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={Search}
		exact={true}
		path={`/${RouteParts.Search}`}
		key={`/${RouteParts.Search}`}
	/>,
];

import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { RouteParts } from '../constants';
import { Search } from './views';

export const renderSearchRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={Search}
		exact={true}
		path={`/${RouteParts.Search}`}
		key={`/${RouteParts.Search}`}
	/>,
];

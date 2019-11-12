import React, { ReactNode } from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { RouteParts } from '../constants';
import Item from './views/Item';

export const renderItemRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={Item}
		exact
		path={`/${RouteParts.Item}/:id`}
		key={`/${RouteParts.Item}/:id`}
	/>,
];

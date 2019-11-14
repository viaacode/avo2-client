import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { RouteParts } from '../constants';
import { Item } from './views';

export const renderItemRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={Item}
		exact
		path={`/${RouteParts.Item}/:id`}
		key={`/${RouteParts.Item}/:id`}
	/>,
];

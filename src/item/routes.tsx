import React from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { RouteParts } from '../routes';
import Item from './views/Item';

export const renderItemRoutes = () => (
	<SecuredRoute component={Item} exact path={`/${RouteParts.Item}/:id`} />
);

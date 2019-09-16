import React from 'react';

import { Route } from 'react-router';
import { RouteParts } from '../constants';
import Item from './views/Item';

export const renderItemRoutes = () => (
	<Route component={Item} exact path={`/${RouteParts.Item}/:id`} />
);

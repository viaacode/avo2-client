import React from 'react';

import { Route } from 'react-router';
import { RouteParts } from '../constants';
import Search from './views/Search';

export const renderSearchRoutes = () => (
	<Route component={Search} path={`/${RouteParts.Search}`} exact={true} />
);

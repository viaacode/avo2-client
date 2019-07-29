import React from 'react';

import { Route } from 'react-router';
import { RouteParts } from '../routes';
import Collection from './views/Collection';

export const renderCollectionRoutes = () => (
	<Route path={`/${RouteParts.Collection}/:id`} component={Collection} exact />
);

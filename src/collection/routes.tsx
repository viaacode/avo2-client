import React, { Fragment } from 'react';

import { Route } from 'react-router';
import { RouteParts } from '../constants';
import Collection from './views/Collection';
import EditCollection from './views/EditCollection';

export const renderCollectionRoutes = () => (
	<Fragment>
		<Route path={`/${RouteParts.Collection}/:id`} component={Collection} exact />
		<Route
			path={`/${RouteParts.Collection}/:id/${RouteParts.Edit}`}
			component={EditCollection}
			exact
		/>
	</Fragment>
);

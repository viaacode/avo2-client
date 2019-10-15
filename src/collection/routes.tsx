import React, { ReactNode } from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { RouteParts } from '../constants';
import CollectionDetail from './views/CollectionDetail';
import CollectionEdit from './views/CollectionEdit';

export const renderCollectionRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={CollectionDetail}
		exact
		path={`/${RouteParts.Collection}/:id`}
		key={`/${RouteParts.Collection}/:id`}
	/>,
	<SecuredRoute
		component={CollectionEdit}
		exact
		path={`/${RouteParts.Collection}/:id/${RouteParts.Edit}`}
		key={`/${RouteParts.Collection}/:id/${RouteParts.Edit}`}
	/>,
];

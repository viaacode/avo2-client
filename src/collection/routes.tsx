import React from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { RouteParts } from '../constants';
import CollectionDetail from './views/CollectionDetail';
import CollectionEdit from './views/CollectionEdit';

export const renderCollectionRoutes = () => (
	<>
		<SecuredRoute path={`/${RouteParts.Collection}/:id`} component={CollectionDetail} exact />
		<SecuredRoute
			path={`/${RouteParts.Collection}/:id/${RouteParts.Edit}`}
			component={CollectionEdit}
			exact
		/>
	</>
);

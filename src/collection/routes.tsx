import React from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { RouteParts } from '../routes';
import Collection from './views/Collection';

export const renderCollectionRoutes = () => (
	<SecuredRoute path={`/${RouteParts.Collection}/:id`} component={Collection} exact />
);

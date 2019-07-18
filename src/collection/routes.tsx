import React from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { RouteParts } from '../routes';
import { Collection } from './views/Collection';

export const renderCollectionRoutes = () => (
	<SecuredRoute component={Collection} path={`/${RouteParts.Collection}/:id`} exact />
);

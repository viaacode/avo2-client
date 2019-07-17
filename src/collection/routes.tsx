import React from 'react';
import SecuredRoute from '../authentication/components/SecuredRoute';
import { Collection } from './views/Collection';

export const renderCollectionRoutes = () => (
	<SecuredRoute component={Collection} path="/collection/:id" exact />
);

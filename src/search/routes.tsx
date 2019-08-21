import React from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { RouteParts } from '../routes';
import Search from './views/Search';

export const renderSearchRoutes = () => (
	<SecuredRoute component={Search} path={`/${RouteParts.Search}`} exact={true} />
);

import React from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { RouteParts } from '../my-workspace/constants';
import Search from './views/Search';

export const renderSearchRoutes = () => (
	<SecuredRoute component={Search} path={`/${RouteParts.Search}`} exact={true} />
);

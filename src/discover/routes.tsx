import React from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import Discover from './views/Discover';

export const renderDiscoverRoutes = () => (
	<SecuredRoute component={Discover} path="/ontdek" exact={true} />
);

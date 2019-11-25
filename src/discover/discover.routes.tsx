import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';

import { DISCOVER_PATH } from './discover.const';
import { Discover } from './views';

export const renderDiscoverRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={Discover}
		exact
		path={DISCOVER_PATH.DISCOVER}
		key={DISCOVER_PATH.DISCOVER}
	/>,
];

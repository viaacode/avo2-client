import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { APP_PATH } from '../constants';

import { Search } from './views';

export const renderSearchRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={Search}
		exact
		path={APP_PATH.SEARCH.route}
		key={APP_PATH.SEARCH.route}
	/>,
];

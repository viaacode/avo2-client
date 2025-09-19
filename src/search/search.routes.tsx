import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components/SecuredRoute';
import { APP_PATH } from '../constants';

import { Search } from './views/Search';

export const renderSearchRoutes = (): ReactNode[] => [
	<SecuredRoute
		Component={Search}
		exact
		path={APP_PATH.SEARCH.route}
		key={APP_PATH.SEARCH.route}
	/>,
];

import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { APP_PATH } from '../constants';

import { Home } from './views';

export const renderHomeRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={Home}
		exact
		path={APP_PATH.LOGGED_IN_HOME.route}
		key={APP_PATH.LOGGED_IN_HOME.route}
	/>,
];

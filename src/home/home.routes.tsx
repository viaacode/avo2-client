import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { HOME_PATH } from './home.const';
import { Home } from './views';

export const renderHomeRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={Home}
		exact
		path={HOME_PATH.LOGGED_IN_HOME}
		key={HOME_PATH.LOGGED_IN_HOME}
	/>,
];

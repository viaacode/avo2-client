import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { APP_PATH } from '../constants';

import Home from './views/Home';

export const renderHomeRoutes = (): ReactNode[] => [
	<SecuredRoute path={APP_PATH.LOGGED_IN_HOME.route} exact Component={Home} key="home-view" />,
];

import { get } from 'lodash-es';
import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { SecuredRoute } from '../authentication/components';
import { HOME_PATH } from './home.const';
import { Home } from './views';

export const renderHomeRoutes = (): ReactNode[] =>
	get(window, '_ENV_.ENV') === 'production'
		? [
				<SecuredRoute
					component={Home}
					exact
					path={HOME_PATH.LOGGED_IN_HOME}
					key={HOME_PATH.LOGGED_IN_HOME}
				/>,
		  ]
		: [
				<Route
					component={Home}
					exact
					path={HOME_PATH.LOGGED_IN_HOME}
					key={HOME_PATH.LOGGED_IN_HOME}
				/>,
		  ];

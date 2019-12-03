import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { APP_PATH } from '../constants';

import { Login, Logout, RegisterOrLogin, RegisterStamboek } from './views';

export const renderAuthenticationRoutes = (): ReactNode[] => [
	<Route component={Login} exact path={APP_PATH.LOGIN_AVO} key={APP_PATH.LOGIN_AVO} />,
	<Route component={Logout} exact path={APP_PATH.LOGOUT} key={APP_PATH.LOGOUT} />,
	<Route component={RegisterStamboek} exact path={APP_PATH.STAMBOEK} key={APP_PATH.STAMBOEK} />,
	<Route
		component={RegisterOrLogin}
		exact
		path={APP_PATH.REGISTER_OR_LOGIN}
		key={APP_PATH.REGISTER_OR_LOGIN}
	/>,
];

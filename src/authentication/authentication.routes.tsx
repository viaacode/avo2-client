import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { RouteParts } from '../constants';

import { Login, Logout, Register, RegisterOrLogin } from './views';

export const renderAuthenticationRoutes = (): ReactNode[] => [
	<Route
		component={Login}
		exact
		path={`/${RouteParts.LoginAvo}`}
		key={`/${RouteParts.LoginAvo}`}
	/>,
	<Route component={Logout} exact path={`/${RouteParts.Logout}`} key={`/${RouteParts.Logout}`} />,
	<Route
		component={Register}
		exact
		path={`/${RouteParts.Register}`}
		key={`/${RouteParts.Register}`}
	/>,
	<Route
		component={RegisterOrLogin}
		exact
		path={`/${RouteParts.RegisterOrLogin}`}
		key={`/${RouteParts.RegisterOrLogin}`}
	/>,
];

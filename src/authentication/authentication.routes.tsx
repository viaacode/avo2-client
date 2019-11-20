import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { RouteParts } from '../constants';

import { Login, Logout, RegisterOrLogin, RegisterPupilOrTeacher, RegisterStamboek } from './views';

export const renderAuthenticationRoutes = (): ReactNode[] => [
	<Route
		component={Login}
		exact
		path={`/${RouteParts.LoginAvo}`}
		key={`/${RouteParts.LoginAvo}`}
	/>,
	<Route component={Logout} exact path={`/${RouteParts.Logout}`} key={`/${RouteParts.Logout}`} />,
	<Route
		component={RegisterPupilOrTeacher}
		exact
		path={`/${RouteParts.PupilOrTeacher}`}
		key={`/${RouteParts.PupilOrTeacher}`}
	/>,
	<Route
		component={RegisterStamboek}
		exact
		path={`/${RouteParts.Stamboek}`}
		key={`/${RouteParts.Stamboek}`}
	/>,
	<Route
		component={RegisterOrLogin}
		exact
		path={`/${RouteParts.RegisterOrLogin}`}
		key={`/${RouteParts.RegisterOrLogin}`}
	/>,
];

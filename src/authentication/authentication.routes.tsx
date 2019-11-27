import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { AUTH_PATH } from './authentication.const';

import { Login, Logout, RegisterOrLogin, RegisterPupilOrTeacher, RegisterStamboek } from './views';

export const renderAuthenticationRoutes = (): ReactNode[] => [
	<Route component={Login} exact path={AUTH_PATH.LOGIN_AVO} key={AUTH_PATH.LOGIN_AVO} />,
	<Route component={Logout} exact path={AUTH_PATH.LOGOUT} key={AUTH_PATH.LOGOUT} />,
	<Route
		component={RegisterPupilOrTeacher}
		exact
		path={AUTH_PATH.PUPIL_OR_TEACHER}
		key={AUTH_PATH.PUPIL_OR_TEACHER}
	/>,
	<Route component={RegisterStamboek} exact path={AUTH_PATH.STAMBOEK} key={AUTH_PATH.STAMBOEK} />,
	<Route
		component={RegisterOrLogin}
		exact
		path={AUTH_PATH.REGISTER_OR_LOGIN}
		key={AUTH_PATH.REGISTER_OR_LOGIN}
	/>,
];

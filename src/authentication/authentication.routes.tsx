import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { APP_PATH } from '../constants';

import { Login, Logout, RegisterOrLogin, RegisterStamboek } from './views';
import StudentTeacher from './views/registration-flow/r10-student-teacher';
import ManualRegistration from './views/registration-flow/r4-manual-registration';
import AcceptConditions from './views/registration-flow/l8-accept-conditions';

export const renderAuthenticationRoutes = (): ReactNode[] => [
	<Route component={Login} exact path={APP_PATH.LOGIN.route} key={APP_PATH.LOGIN.route} />,
	<Route component={Logout} exact path={APP_PATH.LOGOUT.route} key={APP_PATH.LOGOUT.route} />,
	<Route
		component={RegisterStamboek}
		exact
		path={APP_PATH.STAMBOEK.route}
		key={APP_PATH.STAMBOEK.route}
	/>,
	<Route
		component={ManualRegistration}
		exact
		path={APP_PATH.MANUAL_ACCESS_REQUEST.route}
		key={APP_PATH.MANUAL_ACCESS_REQUEST.route}
	/>,
	<Route
		component={StudentTeacher}
		exact
		path={APP_PATH.STUDENT_TEACHER.route}
		key={APP_PATH.STUDENT_TEACHER.route}
	/>,
	<Route
		component={RegisterOrLogin}
		exact
		path={APP_PATH.REGISTER_OR_LOGIN.route}
		key={APP_PATH.REGISTER_OR_LOGIN.route}
	/>,
	<Route
		component={AcceptConditions}
		exact
		path={APP_PATH.ACCEPT_CONDITIONS.route}
		key={APP_PATH.ACCEPT_CONDITIONS.route}
	/>,
];

import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { APP_PATH } from '../constants';

import { Login, Logout, RegisterOrLogin, RegisterStamboek } from './views';
import StudentTeacher from './views/registration-flow/r10-student-teacher';
import ManualRegistration from './views/registration-flow/r4-manual-registration';

export const renderAuthenticationRoutes = (): ReactNode[] => [
	<Route component={Login} exact path={APP_PATH.LOGIN_AVO} key={APP_PATH.LOGIN_AVO} />,
	<Route component={Logout} exact path={APP_PATH.LOGOUT} key={APP_PATH.LOGOUT} />,
	<Route component={RegisterStamboek} exact path={APP_PATH.STAMBOEK} key={APP_PATH.STAMBOEK} />,
	<Route
		component={ManualRegistration}
		exact
		path={APP_PATH.MANUAL_ACCESS_REQUEST}
		key={APP_PATH.MANUAL_ACCESS_REQUEST}
	/>,
	<Route
		component={StudentTeacher}
		exact
		path={APP_PATH.STUDENT_TEACHER}
		key={APP_PATH.STUDENT_TEACHER}
	/>,
	<Route
		component={RegisterOrLogin}
		exact
		path={APP_PATH.REGISTER_OR_LOGIN}
		key={APP_PATH.REGISTER_OR_LOGIN}
	/>,
];

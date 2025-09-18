import React, { type ReactNode } from 'react';
import { Route } from 'react-router';

import { APP_PATH } from '../constants';
import CompleteProfileStep from '../settings/components/CompleteProfileStep';

import { LinkYourAccount, Login, Logout, RegisterOrLogin, RegisterStamboek } from './views';
import AcceptConditions from './views/registration-flow/l8-accept-conditions';
import StudentTeacher from './views/registration-flow/r10-student-teacher';
import ManualRegistration from './views/registration-flow/r4-manual-registration';

export const renderAuthenticationRoutes = (): ReactNode[] => [
	<Route Component={Login} path={APP_PATH.LOGIN.route} key={APP_PATH.LOGIN.route} />,
	<Route Component={Logout} path={APP_PATH.LOGOUT.route} key={APP_PATH.LOGOUT.route} />,
	<Route
		Component={RegisterStamboek}
		path={APP_PATH.STAMBOEK.route}
		key={APP_PATH.STAMBOEK.route}
	/>,
	<Route
		Component={ManualRegistration}
		path={APP_PATH.MANUAL_ACCESS_REQUEST.route}
		key={APP_PATH.MANUAL_ACCESS_REQUEST.route}
	/>,
	<Route
		Component={StudentTeacher}
		path={APP_PATH.STUDENT_TEACHER.route}
		key={APP_PATH.STUDENT_TEACHER.route}
	/>,
	<Route
		Component={RegisterOrLogin}
		path={APP_PATH.REGISTER_OR_LOGIN.route}
		key={APP_PATH.REGISTER_OR_LOGIN.route}
	/>,
	<Route
		Component={LinkYourAccount}
		path={APP_PATH.LINK_YOUR_ACCOUNT.route}
		key={APP_PATH.LINK_YOUR_ACCOUNT.route}
	/>,
	<Route
		Component={AcceptConditions}
		path={APP_PATH.ACCEPT_CONDITIONS.route}
		key={APP_PATH.ACCEPT_CONDITIONS.route}
	/>,
	<Route
		Component={CompleteProfileStep}
		path={APP_PATH.COMPLETE_PROFILE.route}
		key={APP_PATH.COMPLETE_PROFILE.route}
	/>,
];

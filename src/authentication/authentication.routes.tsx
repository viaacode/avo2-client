import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { APP_PATH } from '../constants';
import CompleteProfileStep from '../settings/components/CompleteProfileStep';

import { LinkYourAccount, Login, Logout, RegisterOrLogin, RegisterStamboek } from './views';
import AcceptConditions from './views/registration-flow/l8-accept-conditions';
import StudentTeacher from './views/registration-flow/r10-student-teacher';
import ManualRegistration from './views/registration-flow/r4-manual-registration';

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
		component={LinkYourAccount}
		exact
		path={APP_PATH.LINK_YOUR_ACCOUNT.route}
		key={APP_PATH.LINK_YOUR_ACCOUNT.route}
	/>,
	<Route
		component={AcceptConditions}
		exact
		path={APP_PATH.ACCEPT_CONDITIONS.route}
		key={APP_PATH.ACCEPT_CONDITIONS.route}
	/>,
	<Route
		component={CompleteProfileStep}
		exact
		path={APP_PATH.COMPLETE_PROFILE.route}
		key={APP_PATH.COMPLETE_PROFILE.route}
	/>,
];

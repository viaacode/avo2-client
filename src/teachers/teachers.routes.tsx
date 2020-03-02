import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { APP_PATH } from '../constants';

import { ForTeachers } from './views';

export const renderTeacherRoutes = (): ReactNode[] => [
	<Route
		component={ForTeachers}
		exact
		path={APP_PATH.FOR_TEACHERS.route}
		key={APP_PATH.FOR_TEACHERS.route}
	/>,
	<Route
		component={ForTeachers}
		exact
		path={APP_PATH.LOGGED_OUT_HOME.route}
		key={APP_PATH.LOGGED_OUT_HOME.route}
	/>,
];

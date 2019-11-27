import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { APP_PATH } from '../constants';

import { ForTeachers } from './views';

export const renderTeacherRoutes = (): ReactNode[] => [
	<Route component={ForTeachers} exact path={APP_PATH.FOR_TEACHERS} key={APP_PATH.FOR_TEACHERS} />,
	<Route
		component={ForTeachers}
		exact
		path={APP_PATH.LOGGED_OUT_HOME}
		key={APP_PATH.LOGGED_OUT_HOME}
	/>,
];

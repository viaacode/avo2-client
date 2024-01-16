import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { APP_PATH } from '../../../constants';

import Email from './Email';

export const renderEmailPreferencesLoggedOutRoutes = (): ReactNode[] => [
	<Route
		component={Email}
		path={APP_PATH.EMAIL_PREFERENCES_LOGGED_OUT.route}
		key={APP_PATH.EMAIL_PREFERENCES_LOGGED_OUT.route}
	/>,
];

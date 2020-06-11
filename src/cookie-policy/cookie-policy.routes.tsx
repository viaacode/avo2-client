import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { APP_PATH } from '../constants';

import CookiePolicy from './views/CookiePolicy';

export const renderCookiePolicyRoutes = (): ReactNode[] => [
	<Route
		component={CookiePolicy}
		exact
		path={APP_PATH.COOKIE_POLICY.route}
		key={APP_PATH.COOKIE_POLICY.route}
	/>,
];

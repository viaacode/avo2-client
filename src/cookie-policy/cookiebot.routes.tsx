import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { APP_PATH } from '../constants';

import { CookiePolicy } from './views';

export const renderCookieBotRoutes = (): ReactNode[] => [
	<Route
		path={APP_PATH.COOKIE_POLICY.route}
		exact
		component={CookiePolicy}
		key="cookie-policy"
	/>,
];

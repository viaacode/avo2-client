import React, { type ReactNode } from 'react';
import { Route } from 'react-router';

import { APP_PATH } from '../constants';

import { CookiePolicy } from './views';

export const renderCookieBotRoutes = (): ReactNode[] => [
	<Route path={APP_PATH.COOKIE_POLICY.route} Component={CookiePolicy} key="cookie-policy" />,
];

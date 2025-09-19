import React, { type ReactNode } from 'react';
import { Route } from 'react-router';

import { APP_PATH } from '../constants';

import { ErrorView } from './views/ErrorView';

export const renderErrorRoutes = (): ReactNode[] => [
	<Route path={APP_PATH.ERROR.route} Component={ErrorView} key="error-view" />,
];

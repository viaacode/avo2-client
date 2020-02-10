import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { APP_PATH } from '../constants';

import { ErrorView } from './views';

export const renderErrorRoutes = (): ReactNode[] => [
	<Route path={APP_PATH.ERROR} component={ErrorView} key="error-view" />,
];

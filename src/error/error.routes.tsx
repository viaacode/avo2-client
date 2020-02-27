import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { ErrorView } from './views';
import { APP_PATH } from '../constants';

export const renderErrorRoutes = (): ReactNode[] => [
	<Route path={APP_PATH.ERROR.route} exact component={ErrorView} key="error-view" />,
];

import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { ERROR_PATH } from './error.const';
import { ErrorView } from './views';

export const renderErrorRoutes = (): ReactNode[] => [
	<Route path={ERROR_PATH.ERROR} exact component={ErrorView} key="error-view" />,
];

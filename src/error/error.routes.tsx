import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { ErrorView } from './views';

export const renderErrorRoutes = (): ReactNode[] => [
	<Route component={ErrorView} key="error-view" />,
];

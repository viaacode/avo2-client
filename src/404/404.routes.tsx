import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import NotFound from './views/NotFound';

export const renderNotFoundRoutes = (): ReactNode[] => [
	<Route component={NotFound} key="notfound" />,
];

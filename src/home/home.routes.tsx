import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import Home from './views/Home';

export const renderHomeRoutes = (): ReactNode[] => [
	<Route component={Home} path="/" exact={true} key="/" />,
];

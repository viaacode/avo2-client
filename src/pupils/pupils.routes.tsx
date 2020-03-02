import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { APP_PATH } from '../constants';

import { ForPupils } from './views';

export const renderPupilRoutes = (): ReactNode[] => [
	<Route
		component={ForPupils}
		exact
		path={APP_PATH.FOR_PUPILS.route}
		key={APP_PATH.FOR_PUPILS.route}
	/>,
];

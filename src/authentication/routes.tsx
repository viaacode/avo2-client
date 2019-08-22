import React, { Fragment } from 'react';
import { Route } from 'react-router';

import { RouteParts } from '../my-workspace/constants';
import Login from './views/Login';
import Logout from './views/Logout';

export const renderAuthenticationRoutes = () => (
	<Fragment>
		<Route path={`/${RouteParts.Login}`} component={Login} exact />
		<Route path={`/${RouteParts.Logout}`} component={Logout} exact />
	</Fragment>
);

import React, { Fragment } from 'react';
import { Route } from 'react-router';

import { RouteParts } from '../constants';
import Login from './views/Login';
import Logout from './views/Logout';
import Register from './views/Register';
import RegisterOrLogin from './views/RegisterOrLogin';

export const renderAuthenticationRoutes = () => (
	<Fragment>
		<Route path={`/${RouteParts.LoginAvo}`} component={Login} exact />
		<Route path={`/${RouteParts.Logout}`} component={Logout} exact />
		<Route path={`/${RouteParts.Register}`} component={Register} exact />
		<Route path={`/${RouteParts.RegisterOrLogin}`} component={RegisterOrLogin} exact />
	</Fragment>
);

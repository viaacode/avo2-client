import React, { Fragment } from 'react';
import { Route } from 'react-router';

import Callback from './views/Callback';
import SignIn from './views/SignIn';

export const renderAuthenticationRoutes = () => (
	<Fragment>
		<Route path="/aanmelden" component={SignIn} exact />
		<Route path="/callback" component={Callback} exact />
	</Fragment>
);

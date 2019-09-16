import React, { Fragment } from 'react';

import { Route } from 'react-router';
import { RouteParts } from '../constants';
import MyWorkspace from './views/MyWorkspace';

export const renderMyWorkspaceRoutes = () => (
	<Fragment>
		<Route component={MyWorkspace} path={`/${RouteParts.MyWorkspace}/:tabId`} exact={false} />
	</Fragment>
);

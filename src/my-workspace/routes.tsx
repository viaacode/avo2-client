import React, { Fragment } from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { RouteParts } from '../constants';
import MyWorkspace from './views/MyWorkspace';

export const renderMyWorkspaceRoutes = () => (
	<Fragment>
		<SecuredRoute component={MyWorkspace} path={`/${RouteParts.MyWorkspace}`} exact={true} />
		<SecuredRoute component={MyWorkspace} path={`/${RouteParts.MyWorkspace}/:tabId`} exact={true} />
	</Fragment>
);

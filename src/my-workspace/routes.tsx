import React, { ReactNode } from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { RouteParts } from '../constants';
import MyWorkspace from './views/MyWorkspace';

export const renderMyWorkspaceRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={MyWorkspace}
		exact={true}
		path={`/${RouteParts.MyWorkspace}`}
		key={`/${RouteParts.MyWorkspace}`}
	/>,
	<SecuredRoute
		component={MyWorkspace}
		exact={true}
		path={`/${RouteParts.MyWorkspace}/:tabId`}
		key={`/${RouteParts.MyWorkspace}/:tabId`}
	/>,
];

import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { RouteParts } from '../constants';
import { Workspace } from './views';

export const renderWorkspaceRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={Workspace}
		path={`/${RouteParts.Workspace}`}
		key={`/${RouteParts.Workspace}`}
		exact
	/>,
	<SecuredRoute
		component={Workspace}
		path={`/${RouteParts.Workspace}/:tabId`}
		key={`/${RouteParts.Workspace}/:tabId`}
		exact
	/>,
];

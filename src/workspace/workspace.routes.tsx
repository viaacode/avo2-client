import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { RouteParts } from '../constants';
import { Workspace } from './views';

export const renderWorkspaceRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={Workspace}
		exact={true}
		path={`/${RouteParts.Workspace}`}
		key={`/${RouteParts.Workspace}`}
	/>,
	<SecuredRoute
		component={Workspace}
		exact={true}
		path={`/${RouteParts.Workspace}/:tabId`}
		key={`/${RouteParts.Workspace}/:tabId`}
	/>,
];

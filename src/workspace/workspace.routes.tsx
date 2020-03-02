import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { APP_PATH } from '../constants';

import { Workspace } from './views';

export const renderWorkspaceRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={Workspace}
		exact
		path={APP_PATH.WORKSPACE.route}
		key={APP_PATH.WORKSPACE.route}
	/>,
	<SecuredRoute
		component={Workspace}
		exact
		path={APP_PATH.WORKSPACE_TAB.route}
		key={APP_PATH.WORKSPACE_TAB.route}
	/>,
];

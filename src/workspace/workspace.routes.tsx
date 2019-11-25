import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';

import { Workspace } from './views';
import { WORKSPACE_PATH } from './workspace.const';

export const renderWorkspaceRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={Workspace}
		exact
		path={WORKSPACE_PATH.WORKSPACE}
		key={WORKSPACE_PATH.WORKSPACE}
	/>,
	<SecuredRoute
		component={Workspace}
		exact
		path={WORKSPACE_PATH.WORKSPACE_TAB}
		key={WORKSPACE_PATH.WORKSPACE_TAB}
	/>,
];

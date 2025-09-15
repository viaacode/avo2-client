import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { APP_PATH } from '../constants';
import { ROUTE_PARTS } from '../shared/constants';

import { Workspace } from './views';

export const renderWorkspaceRoutes = (): ReactNode[] => [
	<SecuredRoute
		Component={Workspace}
		exact
		path={APP_PATH.WORKSPACE.route}
		key={APP_PATH.WORKSPACE.route}
	/>,
	<SecuredRoute
		Component={({
			match: {
				params: { id },
			},
			location,
		}) => {
			return <Navigate to={`/${ROUTE_PARTS.assignments}/${id}${location.search}`} />;
		}}
		exact
		path={`${APP_PATH.WORKSPACE.route}${APP_PATH.ASSIGNMENT_DETAIL.route}`}
		key={`${APP_PATH.WORKSPACE.route}${APP_PATH.ASSIGNMENT_DETAIL.route}`}
	/>,
	<SecuredRoute
		Component={Workspace}
		exact
		path={APP_PATH.WORKSPACE_TAB.route}
		key={APP_PATH.WORKSPACE_TAB.route}
	/>,
];

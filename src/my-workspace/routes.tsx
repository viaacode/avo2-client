import React from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { RouteParts } from '../constants';
import MyWorkspace from './views/MyWorkspace';

export const renderMyWorkspaceRoutes = () => (
	<SecuredRoute component={MyWorkspace} path={`/${RouteParts.MyWorkspace}/:tabId`} exact={false} />
);

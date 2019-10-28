import React, { ReactNode } from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { RouteParts } from '../constants';
import Dashboard from './views/Dashboard';

const ADMIN_PATH = {
	DASHBOARD: `/${RouteParts.Admin}`,
};

export const renderAdminRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={ADMIN_PATH.DASHBOARD}
		component={Dashboard}
		exact
		path={ADMIN_PATH.DASHBOARD}
	/>,
];

import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components/SecuredRoute';

import { DASHBOARD_PATH } from './dashboard.const';
import { Dashboard } from './views/Dashboard';

export const renderAdminDashboardRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={DASHBOARD_PATH.DASHBOARD}
		Component={Dashboard}
		exact
		path={DASHBOARD_PATH.DASHBOARD}
	/>,
];

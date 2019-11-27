import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';
import { DASHBOARD_PATH } from './dashboard.const';
import { Dashboard } from './views';

export const renderAdminDashboardRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={DASHBOARD_PATH.DASHBOARD}
		component={Dashboard}
		exact
		path={DASHBOARD_PATH.DASHBOARD}
	/>,
];

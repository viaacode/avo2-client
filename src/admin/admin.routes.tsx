import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { RouteParts } from '../constants';

import { Dashboard } from './views';

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

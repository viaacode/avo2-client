import React, { ReactNode } from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { ADMIN_PATH } from './admin.const';
import Dashboard from './views/Dashboard';
import MenuDetail from './views/Menu/MenuDetail';
import MenuEdit from './views/Menu/MenuEdit';
import MenuOverview from './views/Menu/MenuOverview';

// Menu routes
export const renderAdminRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={ADMIN_PATH.DASHBOARD}
		component={Dashboard}
		exact
		path={ADMIN_PATH.DASHBOARD}
	/>,
	// Menu routes
	<SecuredRoute key={ADMIN_PATH.MENU} component={MenuOverview} exact path={ADMIN_PATH.MENU} />,
	<SecuredRoute
		key={ADMIN_PATH.MENU_DETAIL}
		component={MenuDetail}
		exact
		path={ADMIN_PATH.MENU_DETAIL}
	/>,
	<SecuredRoute
		key={ADMIN_PATH.MENU_CREATE}
		component={MenuEdit}
		exact
		path={ADMIN_PATH.MENU_CREATE}
	/>,
	<SecuredRoute
		key={ADMIN_PATH.MENU_EDIT}
		component={MenuEdit}
		exact
		path={ADMIN_PATH.MENU_EDIT}
	/>,
];

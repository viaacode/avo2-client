import React, { ReactNode } from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { RouteParts } from '../constants';
import Dashboard from './views/Dashboard';
import MenuDetail from './views/Menu/MenuDetail';
import MenuEdit from './views/Menu/MenuEdit';
import MenuOverview from './views/Menu/MenuOverview';

export const ADMIN_PATH = Object.freeze({
	DASHBOARD: `/${RouteParts.Admin}`,
	MENU: `/${RouteParts.Admin}/${RouteParts.Menu}`,
	MENU_DETAIL: `/${RouteParts.Admin}/${RouteParts.Menu}/:menu`,
	MENU_CREATE: `/${RouteParts.Admin}/${RouteParts.Menu}/:menu/${RouteParts.Create}`,
	MENU_EDIT: `/${RouteParts.Admin}/${RouteParts.Menu}/:menu/:id/${RouteParts.Edit}`,
});

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

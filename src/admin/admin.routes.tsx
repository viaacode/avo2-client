import React from 'react';
import { Switch } from 'react-router';

import { renderErrorRoutes } from '../error/error.routes';

import { renderAdminContentRoutes } from './content/content.routes';
import { renderAdminDashboardRoutes } from './dashboard/dashboard.routes';
import { renderAdminMenuRoutes } from './menu/menu.routes';
import { renderAdminPermissionGroupRoutes } from './permission-groups/permission-group.routes';

export const renderAdminRoutes = () => (
	<Switch>
		{renderAdminDashboardRoutes()}
		{renderAdminMenuRoutes()}
		{renderAdminContentRoutes()}
		{renderAdminPermissionGroupRoutes()}
		{/* Default routes */}
		{renderErrorRoutes()}
	</Switch>
);

import React from 'react';
import { Switch } from 'react-router';

import { renderErrorRoutes } from '../error/error.routes';

import { renderAdminContentRoutes } from './content/content.routes';
import { renderAdminDashboardRoutes } from './dashboard/dashboard.routes';
import { renderAdminMenuRoutes } from './menu/menu.routes';
import { renderAdminPermissionGroupRoutes } from './permission-groups/permission-group.routes';
import { renderAdminUserRoutes } from './users/user.routes';

export const renderAdminRoutes = () => (
	<Switch>
		{renderAdminDashboardRoutes()}
		{renderAdminUserRoutes()}
		{renderAdminMenuRoutes()}
		{renderAdminContentRoutes()}
		{renderAdminPermissionGroupRoutes()}
		{/* Default routes */}
		{renderErrorRoutes()}
	</Switch>
);

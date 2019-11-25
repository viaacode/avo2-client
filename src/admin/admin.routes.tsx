import React from 'react';
import { Switch } from 'react-router';

import { renderAuthenticationRoutes } from '../authentication/authentication.routes';
import { renderErrorRoutes } from '../error/error.routes';
import { renderAdminContentRoutes } from './content/content.routes';
import { renderAdminDashboardRoutes } from './dashboard/dashboard.routes';
import { renderAdminMenuRoutes } from './menu/menu.routes';

export const renderAdminRoutes = () => (
	<Switch>
		{renderAdminDashboardRoutes()}
		{renderAdminMenuRoutes()}
		{renderAdminContentRoutes()}
		{/* Default routes */}
		{renderErrorRoutes()}
	</Switch>
);

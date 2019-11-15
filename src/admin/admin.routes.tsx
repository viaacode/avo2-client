import { ReactNode } from 'react';

import { renderAdminDashboardRoutes } from './dashboard/dashboard.routes';
import { renderAdminMenuRoutes } from './menu/menu.routes';

export const renderAdminRoutes = (): ReactNode[] => [
	...renderAdminDashboardRoutes(),
	...renderAdminMenuRoutes(),
];

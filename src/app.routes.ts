import { layout, route, type RouteConfig } from '@react-router/dev/routes';

import { DASHBOARD_PATH } from './admin/dashboard/dashboard.const';

export default [
	layout('src/App.tsx', []),
	layout('./admin/shared/layouts/AdminLayout/AdminLayout.tsx', [
		route(DASHBOARD_PATH.DASHBOARD, './admin/dashboard/views/Dashboard.tsx'),
	]),
] satisfies RouteConfig;

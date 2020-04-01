import { every, some } from 'lodash-es';
import React, { ReactNode } from 'react';
import { Switch } from 'react-router';

import { renderErrorRoutes } from '../error/error.routes';
import { renderCollectionOrBundleRoutes } from './collectionsOrBundles/collections-or-bundles.routes';
import { renderAdminContentRoutes } from './content/content.routes';
import { renderAdminDashboardRoutes } from './dashboard/dashboard.routes';
import { renderInteractiveTourRoutes } from './interactive-tour/interactive-tour.routes';
import { renderItemRoutes } from './items/items.routes';
import { renderAdminMenuRoutes } from './menu/menu.routes';
import { renderAdminPermissionGroupRoutes } from './permission-groups/permission-group.routes';
import { renderAdminTranslationsRoutes } from './translations/translations.routes';
import { renderAdminUserGroupRoutes } from './user-groups/user-group.routes';
import { renderAdminUserRoutes } from './users/user.routes';

export const renderAdminRoutes = (userPermissions: string[]) => {
	const renderWithPermissions = (
		renderFunc: (userPermissions: string[]) => ReactNode[],
		permissions: string[],
		booleanOperator: 'AND' | 'OR' = 'OR'
	): ReactNode[] => {
		if (booleanOperator === 'OR') {
			// OR
			// If at least one of the permissions is met, render the routes
			if (some(permissions, permission => userPermissions.includes(permission))) {
				return renderFunc(userPermissions);
			}
		} else {
			// AND
			// All permissions have to be met
			if (every(permissions, permission => userPermissions.includes(permission))) {
				return renderFunc(userPermissions);
			}
		}
		return [];
	};

	return (
		<Switch>
			{renderAdminDashboardRoutes()}
			{renderWithPermissions(renderAdminUserRoutes, ['VIEW_USERS'])}
			{renderWithPermissions(renderAdminUserGroupRoutes, ['EDIT_USER_GROUPS'])}
			{renderWithPermissions(renderAdminPermissionGroupRoutes, ['EDIT_PERMISSION_GROUPS'])}
			{renderWithPermissions(renderAdminMenuRoutes, ['EDIT_NAVIGATION_BARS'])}
			{renderWithPermissions(
				renderAdminContentRoutes,
				['EDIT_OWN_CONTENT_PAGES', 'EDIT_ANY_CONTENT_PAGES'],
				'OR'
			)}
			{renderWithPermissions(renderItemRoutes, ['VIEW_ITEMS_OVERVIEW'])}
			{renderWithPermissions(
				renderCollectionOrBundleRoutes,
				['VIEW_COLLECTIONS_OVERVIEW', 'VIEW_BUNDLES_OVERVIEW'],
				'OR'
			)}
			{renderWithPermissions(renderInteractiveTourRoutes, ['VIEW_USERS'])}
			{renderWithPermissions(renderAdminTranslationsRoutes, ['VIEW_USERS'])}
			{/* Default routes */}
			{renderErrorRoutes()}
		</Switch>
	);
};

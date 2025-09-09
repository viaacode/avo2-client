import { PermissionName } from '@viaa/avo2-types';
import { every, some } from 'lodash-es';
import React, { type ReactNode } from 'react';
import { Switch } from 'react-router';

import { renderErrorRoutes } from '../error/error.routes';

import { renderAdminAssignmentRoutes } from './assignments/assignment.routes';
import { renderCollectionOrBundleRoutes } from './collectionsOrBundles/collections-or-bundles.routes';
import { renderAdminContentPageRoutes } from './content-page/content-page.routes';
import { renderAdminContentPageLabelRoutes } from './content-page-labels/content-page-label.routes';
import { renderAdminDashboardRoutes } from './dashboard/dashboard.routes';
import { renderInteractiveTourRoutes } from './interactive-tour/interactive-tour.routes';
import { renderItemRoutes, renderPublishItemRoutes } from './items/items.routes';
import { renderAdminNavigationRoutes } from './navigations/navigations.routes';
import { renderAdminPupilCollectionRoutes } from './pupil-collection/pupil-collection.routes';
import { renderRedirectDetailRoutes } from './redirect-detail/redirect-detail.routes';
import { renderAdminTranslationsRoutes } from './translations/translations.routes';
import { renderAdminUserGroupRoutes } from './user-groups/user-group.routes';
import { renderAdminUserRoutes } from './users/user.routes';

export const renderAdminRoutes = (userPermissions: string[]): ReactNode => {
	const renderWithPermissions = (
		renderFunc: (userPermissions: string[]) => ReactNode[],
		permissions: string[],
		booleanOperator: 'AND' | 'OR' = 'OR'
	): ReactNode[] => {
		if (booleanOperator === 'OR') {
			// OR
			// If at least one of the permissions is met, render the routes
			if (some(permissions, (permission) => userPermissions.includes(permission))) {
				return renderFunc(userPermissions);
			}
		} else {
			// AND
			// All permissions have to be met
			if (every(permissions, (permission) => userPermissions.includes(permission))) {
				return renderFunc(userPermissions);
			}
		}
		return [];
	};

	return (
		<Switch>
			{renderAdminDashboardRoutes()}
			{renderWithPermissions(renderAdminUserRoutes, [PermissionName.VIEW_USERS])}
			{renderWithPermissions(renderAdminUserGroupRoutes, [PermissionName.EDIT_USER_GROUPS])}
			{renderWithPermissions(renderAdminNavigationRoutes, [
				PermissionName.EDIT_NAVIGATION_BARS,
			])}
			{renderWithPermissions(
				renderAdminContentPageRoutes,
				[PermissionName.EDIT_OWN_CONTENT_PAGES, PermissionName.EDIT_ANY_CONTENT_PAGES],
				'OR'
			)}
			{renderWithPermissions(renderAdminContentPageLabelRoutes, [
				PermissionName.EDIT_CONTENT_PAGE_LABELS,
			])}
			{renderWithPermissions(renderItemRoutes, [PermissionName.VIEW_ITEMS_OVERVIEW])}
			{renderWithPermissions(renderPublishItemRoutes, [PermissionName.PUBLISH_ITEMS])}
			{renderWithPermissions(
				renderCollectionOrBundleRoutes,
				[PermissionName.VIEW_COLLECTIONS_OVERVIEW, PermissionName.VIEW_BUNDLES_OVERVIEW],
				'OR'
			)}
			{renderWithPermissions(renderAdminAssignmentRoutes, [
				PermissionName.VIEW_ANY_ASSIGNMENTS,
			])}
			{renderWithPermissions(renderAdminPupilCollectionRoutes, [
				PermissionName.VIEW_ANY_PUPIL_COLLECTIONS,
			])}
			{renderWithPermissions(renderInteractiveTourRoutes, [
				PermissionName.EDIT_INTERACTIVE_TOURS,
			])}
			{renderWithPermissions(renderRedirectDetailRoutes, [PermissionName.EDIT_REDIRECTS])}
			{renderWithPermissions(renderAdminTranslationsRoutes, [
				PermissionName.EDIT_TRANSLATIONS,
			])}
			{/* Default routes */}
			{renderErrorRoutes()}
		</Switch>
	);
};

import React from 'react';
import { Switch } from 'react-router';

import { renderNotFoundRoutes } from './404/routes';
import { renderAdminRoutes } from './admin/routes';
import { renderAssignmentRoutes } from './assignment/routes';
import { renderAuthenticationRoutes } from './authentication/routes';
import { renderCollectionRoutes } from './collection/routes';
import { renderDiscoverRoutes } from './discover/routes';
import { renderHomeRoutes } from './home/routes';
import { renderItemRoutes } from './item/routes';
import { renderMyWorkspaceRoutes } from './my-workspace/routes';
import { renderSearchRoutes } from './search/routes';

export const renderRoutes = () => (
	<Switch>
		{renderHomeRoutes()}
		{renderSearchRoutes()}
		{renderItemRoutes()}
		{renderDiscoverRoutes()}
		{renderCollectionRoutes()}
		{renderAssignmentRoutes()}
		{renderMyWorkspaceRoutes()}
		{renderAdminRoutes()}
		{renderAuthenticationRoutes()}
		{renderNotFoundRoutes()}
	</Switch>
);

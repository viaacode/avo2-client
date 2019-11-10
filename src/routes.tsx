import React from 'react';
import { Switch } from 'react-router';

import { renderAdminRoutes } from './admin/routes';
import { renderAssignmentRoutes } from './assignment/routes';
import { renderAuthenticationRoutes } from './authentication/routes';
import { renderCollectionRoutes } from './collection/collection.routes';
import { renderDiscoverRoutes } from './discover/routes';
import { renderErrorRoutes } from './error/routes';
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
		{renderErrorRoutes()}
	</Switch>
);

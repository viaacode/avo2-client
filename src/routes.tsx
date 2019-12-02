import React from 'react';
import { Switch } from 'react-router';

import { renderAssignmentRoutes } from './assignment/assignment.routes';
import { renderAuthenticationRoutes } from './authentication/authentication.routes';
import { renderCollectionRoutes } from './collection/collection.routes';
import { renderDiscoverRoutes } from './discover/discover.routes';
import { renderErrorRoutes } from './error/error.routes';
import { renderHomeRoutes } from './home/home.routes';
import { renderItemRoutes } from './item/item.routes';
import { renderPupilRoutes } from './pupils/pupils.routes';
import { renderSearchRoutes } from './search/search.routes';
import { renderTeacherRoutes } from './teachers/teachers.routes';
import { renderWorkspaceRoutes } from './workspace/workspace.routes';

export const renderRoutes = () => (
	<Switch>
		{renderHomeRoutes()}
		{renderSearchRoutes()}
		{renderItemRoutes()}
		{renderDiscoverRoutes()}
		{renderTeacherRoutes()}
		{renderPupilRoutes()}
		{renderCollectionRoutes()}
		{renderAssignmentRoutes()}
		{renderWorkspaceRoutes()}
		{renderAuthenticationRoutes()}
		{renderErrorRoutes()}
	</Switch>
);

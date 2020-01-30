import React from 'react';
import { Switch } from 'react-router';

import { renderAssignmentRoutes } from './assignment/assignment.routes';
import { renderAuthenticationRoutes } from './authentication/authentication.routes';
import { renderBundleRoutes } from './bundle/bundle.routes';
import { renderCollectionRoutes } from './collection/collection.routes';
import { renderContentPageRoutes } from './content-page/content-page.routes';
import { renderErrorRoutes } from './error/error.routes';
import { renderHomeRoutes } from './home/home.routes';
import { renderItemRoutes } from './item/item.routes';
import { renderPupilRoutes } from './pupils/pupils.routes';
import { renderSearchRoutes } from './search/search.routes';
import { renderSettingsRoutes } from './settings/settings.routes';
import { renderTeacherRoutes } from './teachers/teachers.routes';
import { renderWorkspaceRoutes } from './workspace/workspace.routes';

export const renderRoutes = () => (
	<Switch>
		{renderHomeRoutes()}
		{renderSearchRoutes()}
		{renderItemRoutes()}
		{renderTeacherRoutes()}
		{renderPupilRoutes()}
		{renderCollectionRoutes()}
		{renderBundleRoutes()}
		{renderAssignmentRoutes()}
		{renderWorkspaceRoutes()}
		{renderAuthenticationRoutes()}
		{renderSettingsRoutes()}
		{renderContentPageRoutes()}
		{renderErrorRoutes()}
	</Switch>
);

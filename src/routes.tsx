import React, { Fragment } from 'react';

import { renderNotFoundRoutes } from './404/routes';
import { renderAuthenticationRoutes } from './authentication/routes';
import { renderCollectionRoutes } from './collection/routes';
import { renderHomeRoutes } from './home/routes';
import { renderItemRoutes } from './item/routes';
import { renderMyWorkspaceRoutes } from './my-workspace/routes';
import { renderSearchRoutes } from './search/routes';

export enum RouteParts {
	Search = 'zoeken',
	Item = 'item',
	Collection = 'collectie',
	Collections = 'collecties',
	MyWorkspace = 'mijn-werkruimte',
	Bookmarks = 'bladwijzers',
	Folders = 'mappen',
	Login = 'aanmelden',
	Logout = 'afmelden',
	Register = 'registreren',
	Discover = 'ontdek',
	Projects = 'projecten',
	News = 'nieuws',
	Edit = 'bewerk',
}

export const renderRoutes = () => (
	<Fragment>
		{renderHomeRoutes()}
		{renderSearchRoutes()}
		{renderItemRoutes()}
		{renderCollectionRoutes()}
		{renderMyWorkspaceRoutes()}
		{renderAuthenticationRoutes()}
		{renderNotFoundRoutes()}
	</Fragment>
);

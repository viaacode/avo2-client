import React, { Fragment } from 'react';

import { Avo } from '@viaa/avo2-types';

import { renderAuthenticationRoutes } from './authentication/routes';
import { renderCollectionRoutes } from './collection/routes';
import { renderHomeRoutes } from './home/routes';
import { renderItemRoutes } from './item/routes';
import { renderMyWorkspaceRoutes } from './my-workspace/routes';
import { renderSearchRoutes } from './search/routes';

export enum RouteParts {
	Search = 'zoeken',
	Item = 'item',
	Folder = 'map',
	Collection = 'collectie',
	Collections = 'collecties',
	MyWorkspace = 'mijn-werkruimte',
	Bookmarks = 'bladwijzers',
	Login = 'aanmelden',
	Logout = 'afmelden',
	Register = 'registreren',
	Discover = 'ontdek',
	Projects = 'projecten',
	News = 'nieuws',
	Edit = 'bewerk',
}

export const CONTENT_TYPE_TO_ROUTE: { [contentType in Avo.Core.ContentType]: string } = {
	video: RouteParts.Item,
	audio: RouteParts.Item,
	collection: RouteParts.Collection,
	bundle: RouteParts.Folder,
};

export const renderRoutes = () => (
	<Fragment>
		{renderHomeRoutes()}
		{renderSearchRoutes()}
		{renderItemRoutes()}
		{renderCollectionRoutes()}
		{renderMyWorkspaceRoutes()}
		{renderAuthenticationRoutes()}
	</Fragment>
);

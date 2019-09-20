import React, { Fragment } from 'react';

// import { renderNotFoundRoutes } from './404/routes';
import { renderAuthenticationRoutes } from './authentication/routes';
import { renderCollectionRoutes } from './collection/routes';
import { renderDiscoverRoutes } from './discover/routes';
import { renderHomeRoutes } from './home/routes';
import { renderItemRoutes } from './item/routes';
import { renderMyWorkspaceRoutes } from './my-workspace/routes';
import { renderSearchRoutes } from './search/routes';

export const renderRoutes = () => (
	<Fragment>
		{renderHomeRoutes()}
		{renderSearchRoutes()}
		{renderItemRoutes()}
		{renderDiscoverRoutes()}
		{renderCollectionRoutes()}
		{renderMyWorkspaceRoutes()}
		{renderAuthenticationRoutes()}
		{/*{renderNotFoundRoutes()}*/}
	</Fragment>
);

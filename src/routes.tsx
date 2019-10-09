import React from 'react';

import { renderAssignmentRoutes } from './assignment/routes';
import { renderAuthenticationRoutes } from './authentication/routes';
import { renderCollectionRoutes } from './collection/routes';
import { renderDiscoverRoutes } from './discover/routes';
import { renderHomeRoutes } from './home/routes';
import { renderItemRoutes } from './item/routes';
import { renderMyWorkspaceRoutes } from './my-workspace/routes';
import { renderSearchRoutes } from './search/routes';
// import { renderNotFoundRoutes } from './404/routes';

export const renderRoutes = () => (
	<>
		{renderHomeRoutes()}
		{renderSearchRoutes()}
		{renderItemRoutes()}
		{renderDiscoverRoutes()}
		{renderCollectionRoutes()}
		{renderAssignmentRoutes()}
		{renderMyWorkspaceRoutes()}
		{renderAuthenticationRoutes()}
		{/*{renderNotFoundRoutes()}*/}
	</>
);

import React, { Fragment } from 'react';
import { renderAuthenticationRoutes } from './authentication/routes';
import { renderCollectionRoutes } from './collection/routes';
import { renderItemRoutes } from './item/routes';
import { renderSearchRoutes } from './search/routes';

export const renderRoutes = () => (
	<Fragment>
		{renderSearchRoutes()}
		{renderItemRoutes()}
		{renderCollectionRoutes()}
		{renderAuthenticationRoutes()}
	</Fragment>
);

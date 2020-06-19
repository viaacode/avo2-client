import React from 'react';
import { Switch } from 'react-router';

import { renderAssignmentRoutes } from './assignment/assignment.routes';
import { renderAuthenticationRoutes } from './authentication/authentication.routes';
import { renderBundleRoutes } from './bundle/bundle.routes';
import { renderCollectionRoutes } from './collection/collection.routes';
import { renderCookieBotRoutes } from './cookie-policy/cookiebot.routes';
import { renderDynamicRouteResolverRoutes } from './dynamic-route-resolver/dynamic-route-resolver.routes';
import { renderErrorRoutes } from './error/error.routes';
import { renderHomeRoutes } from './home/home.routes';
import { renderItemRoutes } from './item/item.routes';
import { renderKlaarRoutes } from './klaar/klaar.routes';
import { renderSearchRoutes } from './search/search.routes';
import { renderSettingsRoutes } from './settings/settings.routes';
import { renderUserItemRequestFormRoutes } from './user-item-request-form/user-item-request-form.routes';
import { renderWorkspaceRoutes } from './workspace/workspace.routes';

export const renderRoutes = () => (
	<Switch>
		{renderHomeRoutes()}
		{renderSearchRoutes()}
		{renderItemRoutes()}
		{renderCollectionRoutes()}
		{renderBundleRoutes()}
		{renderAssignmentRoutes()}
		{renderWorkspaceRoutes()}
		{renderAuthenticationRoutes()}
		{renderSettingsRoutes()}
		{renderErrorRoutes()}
		{renderUserItemRequestFormRoutes()}
		{renderKlaarRoutes()}
		{renderCookieBotRoutes()}
		{/* This route needs to be the last one, since it handles all remaining routes */}
		{renderDynamicRouteResolverRoutes()}
	</Switch>
);

import React from 'react';
import { Route, Routes } from 'react-router-dom';

import AdminRedirect from './admin/AdminRedirect';
import { renderAssignmentRoutes } from './assignment/assignment.routes';
import { renderAuthenticationRoutes } from './authentication/authentication.routes';
import { renderBundleRoutes } from './bundle/bundle.routes';
import { renderCollectionRoutes } from './collection/collection.routes';
import { renderCookieBotRoutes } from './cookie-policy/cookiebot.routes';
import { renderDynamicRouteResolverRoutes } from './dynamic-route-resolver/dynamic-route-resolver.routes';
import { renderEmbedRoutes } from './embed-code/embed-code.routes';
import { renderErrorRoutes } from './error/error.routes';
import { renderHomeRoutes } from './home/home.routes';
import { renderItemRoutes } from './item/item.routes';
import { renderQuickLaneRoutes } from './quick-lane/quick-lane.routes';
import { renderSearchRoutes } from './search/search.routes';
import { renderEmailPreferencesLoggedOutRoutes } from './settings/components/Email/email-preferences-logged-out.routes';
import { renderSettingsRoutes } from './settings/settings.routes';
import { renderUserItemRequestFormRoutes } from './user-item-request-form/user-item-request-form.routes';
import { renderWorkspaceRoutes } from './workspace/workspace.routes';

export const renderRoutes = () => (
	<Routes>
		<Route path="/beheer" Component={AdminRedirect} />
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
		{renderCookieBotRoutes()}
		{renderQuickLaneRoutes()}
		{renderEmbedRoutes()}
		{renderEmailPreferencesLoggedOutRoutes()}
		{/* This route needs to be the last one, since it handles all remaining routes */}
		{renderDynamicRouteResolverRoutes()}
	</Routes>
);

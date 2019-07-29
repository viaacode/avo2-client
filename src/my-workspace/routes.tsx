import React, { Fragment } from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import Collections from '../collection/views/Collections';
import { RouteParts } from '../routes';
import Bookmarks from './views/Bookmarks';

export const renderMyWorkspaceRoutes = () => (
	<Fragment>
		<SecuredRoute
			component={Collections}
			path={`/${RouteParts.MyWorkspace}/${RouteParts.Collections}`}
			exact
		/>
		<SecuredRoute
			component={Bookmarks}
			path={`/${RouteParts.MyWorkspace}/${RouteParts.Bookmarks}`}
			exact
		/>
	</Fragment>
);

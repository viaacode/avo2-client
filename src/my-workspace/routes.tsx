import React, { Fragment } from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import Collections from '../collection/views/Collections';
import { RouteParts } from '../routes';
import Bookmarks from './views/Bookmarks';
import MyWorkspace from './views/MyWorkspace';

export const renderMyWorkspaceRoutes = () => (
	<Fragment>
		<SecuredRoute
			component={MyWorkspace}
			path={`/${RouteParts.MyWorkspace}/:tabId`}
			exact={false}
		/>
	</Fragment>
);

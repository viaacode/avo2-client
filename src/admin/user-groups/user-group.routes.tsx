import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { USER_GROUP_PATH } from './user-group.const';
import UserGroupOverviewPage from './views/UserGroupOverviewPage';

export const renderAdminUserGroupRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={USER_GROUP_PATH.USER_GROUP_OVERVIEW}
		component={UserGroupOverviewPage}
		exact
		path={USER_GROUP_PATH.USER_GROUP_OVERVIEW}
	/>,
];

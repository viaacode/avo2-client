import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components/SecuredRoute';

import { USER_PATH } from './user.const';
import UserDetailPage from './views/UserDetailPage';
import { UserEditPage } from './views/UserEditPage';
import { UserOverviewPage } from './views/UserOverviewPage';

export const renderAdminUserRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={USER_PATH.USER_OVERVIEW}
		Component={UserOverviewPage}
		exact
		path={USER_PATH.USER_OVERVIEW}
	/>,
	<SecuredRoute
		key={USER_PATH.USER_DETAIL}
		Component={UserDetailPage}
		exact
		path={USER_PATH.USER_DETAIL}
	/>,
	<SecuredRoute
		key={USER_PATH.USER_EDIT}
		Component={UserEditPage}
		exact
		path={USER_PATH.USER_EDIT}
	/>,
];

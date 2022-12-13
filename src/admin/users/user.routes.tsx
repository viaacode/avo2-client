import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { USER_PATH } from './user.const';
import { UserDetailPage, UserOverviewPage } from './views';
import UserEdit from './views/UserEdit';

export const renderAdminUserRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={USER_PATH.USER_OVERVIEW}
		component={UserOverviewPage}
		exact
		path={USER_PATH.USER_OVERVIEW}
	/>,
	<SecuredRoute
		key={USER_PATH.USER_DETAIL}
		component={UserDetailPage}
		exact
		path={USER_PATH.USER_DETAIL}
	/>,
	<SecuredRoute
		key={USER_PATH.USER_EDIT}
		component={UserEdit}
		exact
		path={USER_PATH.USER_EDIT}
	/>,
];

import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { USER_PATH } from './user.const';
import { UserDetail, UserOverview } from './views';

export const renderAdminUserRoutes = (): ReactNode[] => [
	<SecuredRoute key={USER_PATH.USER} component={UserOverview} exact path={USER_PATH.USER} />,
	<SecuredRoute
		key={USER_PATH.USER_DETAIL}
		component={UserDetail}
		exact
		path={USER_PATH.USER_DETAIL}
	/>,
];

import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { USER_GROUP_PATH } from './user-group.const';
import { UserGroupDetail, UserGroupEdit, UserGroupOverview } from './views';

export const renderAdminUserGroupRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={USER_GROUP_PATH.USER_GROUP_OVERVIEW}
		component={UserGroupOverview}
		exact
		path={USER_GROUP_PATH.USER_GROUP_OVERVIEW}
	/>,
	<SecuredRoute
		key={USER_GROUP_PATH.USER_GROUP_CREATE}
		component={UserGroupEdit}
		exact
		path={USER_GROUP_PATH.USER_GROUP_CREATE}
	/>,
	<SecuredRoute
		key={USER_GROUP_PATH.USER_GROUP_DETAIL}
		component={UserGroupDetail}
		exact
		path={USER_GROUP_PATH.USER_GROUP_DETAIL}
	/>,
	<SecuredRoute
		key={USER_GROUP_PATH.USER_GROUP_EDIT}
		component={UserGroupEdit}
		exact
		path={USER_GROUP_PATH.USER_GROUP_EDIT}
	/>,
];

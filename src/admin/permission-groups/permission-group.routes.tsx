import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { PERMISSION_GROUP_PATH } from './permission-group.const';
import { PermissionGroupDetail, PermissionGroupOverview } from './views';
import PermissionGroupEdit from './views/PermissionGroupEdit';

export const renderAdminPermissionGroupRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={PERMISSION_GROUP_PATH.PERMISSION_GROUP_OVERVIEW}
		component={PermissionGroupOverview}
		exact
		path={PERMISSION_GROUP_PATH.PERMISSION_GROUP_OVERVIEW}
	/>,
	<SecuredRoute
		key={PERMISSION_GROUP_PATH.PERMISSION_GROUP_CREATE}
		component={PermissionGroupEdit}
		exact
		path={PERMISSION_GROUP_PATH.PERMISSION_GROUP_CREATE}
	/>,
	<SecuredRoute
		key={PERMISSION_GROUP_PATH.PERMISSION_GROUP_EDIT}
		component={PermissionGroupEdit}
		exact
		path={PERMISSION_GROUP_PATH.PERMISSION_GROUP_EDIT}
	/>,
	<SecuredRoute
		key={PERMISSION_GROUP_PATH.PERMISSION_GROUP_DETAIL}
		component={PermissionGroupDetail}
		exact
		path={PERMISSION_GROUP_PATH.PERMISSION_GROUP_DETAIL}
	/>,
];

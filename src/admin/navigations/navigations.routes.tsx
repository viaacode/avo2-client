import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components/SecuredRoute';

import { NAVIGATIONS_PATH } from './navigations.const';
import { NavigationBarDetail, NavigationBarOverview, NavigationItemEdit } from './views';

export const renderAdminNavigationRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={NAVIGATIONS_PATH.NAVIGATIONS_OVERVIEW}
		Component={NavigationBarOverview}
		exact
		path={NAVIGATIONS_PATH.NAVIGATIONS_OVERVIEW}
	/>,
	<SecuredRoute
		key={NAVIGATIONS_PATH.NAVIGATIONS_CREATE}
		Component={NavigationItemEdit}
		exact
		path={NAVIGATIONS_PATH.NAVIGATIONS_CREATE}
	/>,
	<SecuredRoute
		key={NAVIGATIONS_PATH.NAVIGATIONS_DETAIL}
		Component={NavigationBarDetail}
		exact
		path={NAVIGATIONS_PATH.NAVIGATIONS_DETAIL}
	/>,
	<SecuredRoute
		key={NAVIGATIONS_PATH.NAVIGATIONS_ITEM_CREATE}
		Component={NavigationItemEdit}
		exact
		path={NAVIGATIONS_PATH.NAVIGATIONS_ITEM_CREATE}
	/>,
	<SecuredRoute
		key={NAVIGATIONS_PATH.NAVIGATIONS_ITEM_EDIT}
		Component={NavigationItemEdit}
		exact
		path={NAVIGATIONS_PATH.NAVIGATIONS_ITEM_EDIT}
	/>,
];

import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { NAVIGATIONS_PATH } from './navigations.const';
import { NavigationBarDetail, NavigationBarOverview, NavigationItemEdit } from './views';

export const renderAdminNavigationRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={NAVIGATIONS_PATH.NAVIGATIONS_OVERVIEW}
		component={NavigationBarOverview}
		exact
		path={NAVIGATIONS_PATH.NAVIGATIONS_OVERVIEW}
	/>,
	<SecuredRoute
		key={NAVIGATIONS_PATH.NAVIGATIONS_CREATE}
		component={NavigationItemEdit}
		exact
		path={NAVIGATIONS_PATH.NAVIGATIONS_CREATE}
	/>,
	<SecuredRoute
		key={NAVIGATIONS_PATH.NAVIGATIONS_DETAIL}
		component={NavigationBarDetail}
		exact
		path={NAVIGATIONS_PATH.NAVIGATIONS_DETAIL}
	/>,
	<SecuredRoute
		key={NAVIGATIONS_PATH.NAVIGATIONS_ITEM_CREATE}
		component={NavigationItemEdit}
		exact
		path={NAVIGATIONS_PATH.NAVIGATIONS_ITEM_CREATE}
	/>,
	<SecuredRoute
		key={NAVIGATIONS_PATH.NAVIGATIONS_ITEM_EDIT}
		component={NavigationItemEdit}
		exact
		path={NAVIGATIONS_PATH.NAVIGATIONS_ITEM_EDIT}
	/>,
];

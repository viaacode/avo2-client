import { CONTENT_PAGE_PATH } from '@meemoo/admin-core-ui';
import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';
import { ADMIN_CORE_ROUTE_PARTS } from '../shared/constants/admin-core.routes';

// import ContentPageDetailPage from './views/ContentPageDetailPage';
import ContentPageOverviewPage from './views/ContentPageOverviewPage';

export const renderAdminContentPageRoutes = (): ReactNode[] => {
	return [
		<SecuredRoute
			key={CONTENT_PAGE_PATH(ADMIN_CORE_ROUTE_PARTS).OVERVIEW}
			component={ContentPageOverviewPage}
			exact
			path={CONTENT_PAGE_PATH(ADMIN_CORE_ROUTE_PARTS).OVERVIEW}
		/>,
		// <SecuredRoute
		// 	key={CONTENT_PAGE_PATH(ADMIN_CORE_ROUTE_PARTS).DETAIL}
		// 	component={ContentPageDetailPage}
		// 	exact
		// 	path={CONTENT_PAGE_PATH(ADMIN_CORE_ROUTE_PARTS).DETAIL}
		// />,
	];
};

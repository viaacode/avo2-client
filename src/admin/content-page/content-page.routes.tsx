import { CONTENT_PAGE_PATH } from '@meemoo/admin-core-ui';
import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import ContentPageOverviewPage from './views/ContentPageOverviewPage';

export const renderAdminContentPageRoutes = (): ReactNode[] => {
	console.info(CONTENT_PAGE_PATH);

	return [
		<SecuredRoute
			key={CONTENT_PAGE_PATH.OVERVIEW}
			component={ContentPageOverviewPage}
			exact
			path={CONTENT_PAGE_PATH.OVERVIEW}
		/>,
	];
};

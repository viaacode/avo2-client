import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { CONTENT_PAGE_PATH } from './content-page.const';
import ContentPageOverviewPage from './views/ContentPageOverviewPage';

export const renderAdminContentPageRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={CONTENT_PAGE_PATH.OVERVIEW}
		component={ContentPageOverviewPage}
		exact
		path={CONTENT_PAGE_PATH.OVERVIEW}
	/>,
];

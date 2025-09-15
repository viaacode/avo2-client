import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { CONTENT_PAGE_PATH } from './content-page.consts';
import ContentPageDetailPage from './views/ContentPageDetailPage';
import ContentPageEditPage from './views/ContentPageEditPage';
import ContentPageOverviewPage from './views/ContentPageOverviewPage';

export const renderAdminContentPageRoutes = (): ReactNode[] => {
	return [
		<SecuredRoute
			key={CONTENT_PAGE_PATH.CONTENT_PAGE_OVERVIEW}
			Component={ContentPageOverviewPage}
			exact
			path={CONTENT_PAGE_PATH.CONTENT_PAGE_OVERVIEW}
		/>,
		<SecuredRoute
			key={CONTENT_PAGE_PATH.CONTENT_PAGE_CREATE}
			Component={ContentPageEditPage}
			exact
			path={CONTENT_PAGE_PATH.CONTENT_PAGE_CREATE}
		/>,
		<SecuredRoute
			key={CONTENT_PAGE_PATH.CONTENT_PAGE_DETAIL}
			Component={ContentPageDetailPage}
			exact
			path={CONTENT_PAGE_PATH.CONTENT_PAGE_DETAIL}
		/>,
		<SecuredRoute
			key={CONTENT_PAGE_PATH.CONTENT_PAGE_EDIT}
			Component={ContentPageEditPage}
			exact
			path={CONTENT_PAGE_PATH.CONTENT_PAGE_EDIT}
		/>,
	];
};

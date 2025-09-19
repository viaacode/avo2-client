import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components/SecuredRoute';

import { CONTENT_PAGE_LABEL_PATH } from './content-page-label.const';
import ContentPageLabelDetailPage from './views/ContentPageLabelDetailPage';
import ContentPageLabelEditPage from './views/ContentPageLabelEditPage';
import ContentPageLabelOverviewPage from './views/ContentPageLabelOverviewPage';

export const renderAdminContentPageLabelRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_OVERVIEW}
		Component={ContentPageLabelOverviewPage}
		exact
		path={CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_OVERVIEW}
	/>,
	<SecuredRoute
		key={CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_CREATE}
		Component={ContentPageLabelEditPage}
		exact
		path={CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_CREATE}
	/>,
	<SecuredRoute
		key={CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_EDIT}
		Component={ContentPageLabelEditPage}
		exact
		path={CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_EDIT}
	/>,
	<SecuredRoute
		key={CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_DETAIL}
		Component={ContentPageLabelDetailPage}
		exact
		path={CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_DETAIL}
	/>,
];

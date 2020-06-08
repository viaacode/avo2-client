import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { CONTENT_PAGE_LABEL_PATH } from './content-page-label.const';
import { ContentPageLabelDetail, ContentPageLabelEdit, ContentPageLabelOverview } from './views';

export const renderAdminContentPageLabelRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_OVERVIEW}
		component={ContentPageLabelOverview}
		exact
		path={CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_OVERVIEW}
	/>,
	<SecuredRoute
		key={CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_CREATE}
		component={ContentPageLabelEdit}
		exact
		path={CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_CREATE}
	/>,
	<SecuredRoute
		key={CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_EDIT}
		component={ContentPageLabelEdit}
		exact
		path={CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_EDIT}
	/>,
	<SecuredRoute
		key={CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_DETAIL}
		component={ContentPageLabelDetail}
		exact
		path={CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_DETAIL}
	/>,
];

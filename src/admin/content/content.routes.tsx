import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { CONTENT_PATH } from './content.const';
import { ContentDetail, ContentEdit, ContentOverview } from './views';

export const renderAdminContentRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={CONTENT_PATH.PROJECTS}
		component={ContentOverview}
		exact
		path={CONTENT_PATH.PROJECTS}
	/>,
	<SecuredRoute
		key={CONTENT_PATH.NEWS}
		component={ContentOverview}
		exact
		path={CONTENT_PATH.NEWS}
	/>,
	<SecuredRoute
		key={CONTENT_PATH.FAQS}
		component={ContentOverview}
		exact
		path={CONTENT_PATH.NEWS}
	/>,
	<SecuredRoute
		key={CONTENT_PATH.CONTENT}
		component={ContentOverview}
		exact
		path={CONTENT_PATH.CONTENT}
	/>,
	<SecuredRoute
		key={CONTENT_PATH.CONTENT_CREATE}
		component={ContentEdit}
		exact
		path={CONTENT_PATH.CONTENT_CREATE}
	/>,
	<SecuredRoute
		key={CONTENT_PATH.CONTENT_DETAIL}
		component={ContentDetail}
		exact
		path={CONTENT_PATH.CONTENT_DETAIL}
	/>,
	<SecuredRoute
		key={CONTENT_PATH.CONTENT_EDIT}
		component={ContentEdit}
		exact
		path={CONTENT_PATH.CONTENT_EDIT}
	/>,
];

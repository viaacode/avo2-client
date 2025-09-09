import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { REDIRECT_DETAIL_PATH } from './redirect-detail.const';
import { RedirectDetailEdit, RedirectDetailOverview } from './views';

export const renderRedirectDetailRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={REDIRECT_DETAIL_PATH.REDIRECT_OVERVIEW}
		component={RedirectDetailOverview}
		exact
		path={REDIRECT_DETAIL_PATH.REDIRECT_OVERVIEW}
	/>,
	<SecuredRoute
		key={REDIRECT_DETAIL_PATH.REDIRECT_CREATE}
		component={RedirectDetailEdit}
		exact
		path={REDIRECT_DETAIL_PATH.REDIRECT_CREATE}
	/>,
	<SecuredRoute
		key={REDIRECT_DETAIL_PATH.REDIRECT_EDIT}
		component={RedirectDetailEdit}
		exact
		path={REDIRECT_DETAIL_PATH.REDIRECT_EDIT}
	/>,
];

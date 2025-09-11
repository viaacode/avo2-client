import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { URL_REDIRECT_PATH } from './url-redirects.const';
import { UrlRedirectEdit, UrlRedirectOverview } from './views';

export const renderUrlRedirectRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={URL_REDIRECT_PATH.URL_REDIRECT_OVERVIEW}
		component={UrlRedirectOverview}
		exact
		path={URL_REDIRECT_PATH.URL_REDIRECT_OVERVIEW}
	/>,
	<SecuredRoute
		key={URL_REDIRECT_PATH.URL_REDIRECT_CREATE}
		component={UrlRedirectEdit}
		exact
		path={URL_REDIRECT_PATH.URL_REDIRECT_CREATE}
	/>,
	<SecuredRoute
		key={URL_REDIRECT_PATH.URL_REDIRECT_EDIT}
		component={UrlRedirectEdit}
		exact
		path={URL_REDIRECT_PATH.URL_REDIRECT_EDIT}
	/>,
];

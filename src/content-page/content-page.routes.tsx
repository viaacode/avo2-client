import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { CONTENT_PATH } from './content-page.const';
import { ContentPage } from './views';

export const renderContentPageRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={ContentPage}
		exact
		path={CONTENT_PATH.CONTENT_PAGE}
		key={CONTENT_PATH.CONTENT_PAGE}
	/>,
];

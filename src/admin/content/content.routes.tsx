import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { CONTENT_PATH } from './content.const';
import { ContentOverview } from './views';

export const renderAdminContentRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={CONTENT_PATH.CONTENT}
		component={ContentOverview}
		exact
		path={CONTENT_PATH.CONTENT}
	/>,
];

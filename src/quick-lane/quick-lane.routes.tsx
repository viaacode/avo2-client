import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { APP_PATH } from '../constants';

import { Detail } from './views';

export const renderQuickLaneRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={Detail}
		exact
		path={APP_PATH.QUICK_LANE.route}
		key={APP_PATH.QUICK_LANE.route}
	/>,
];

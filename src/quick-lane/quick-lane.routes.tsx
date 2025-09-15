import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { APP_PATH } from '../constants';

import { QuickLaneDetail } from './views';

export const renderQuickLaneRoutes = (): ReactNode[] => [
	<SecuredRoute
		Component={QuickLaneDetail}
		exact
		path={APP_PATH.QUICK_LANE.route}
		key={APP_PATH.QUICK_LANE.route}
	/>,
];

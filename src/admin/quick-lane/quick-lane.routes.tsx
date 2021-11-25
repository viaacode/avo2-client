import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { QUICK_LANE_PATH } from './quick-lane.const';
import QuickLaneOverview from './views/QuickLaneOverview';

export const renderQuickLaneRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={QUICK_LANE_PATH.QUICK_LANE_OVERVIEW}
		component={QuickLaneOverview}
		exact
		path={QUICK_LANE_PATH.QUICK_LANE_OVERVIEW}
	/>,
];

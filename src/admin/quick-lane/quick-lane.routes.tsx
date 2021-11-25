import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { QUICK_LANE_PATH } from './quick-lane.const';

export const renderQuickLaneRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={QUICK_LANE_PATH.QUICK_LANE_OVERVIEW}
		component={() => <h1>Overview</h1>}
		exact
		path={QUICK_LANE_PATH.QUICK_LANE_OVERVIEW}
	/>,
];

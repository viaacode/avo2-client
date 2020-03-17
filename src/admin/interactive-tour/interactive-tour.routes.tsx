import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { INTERACTIVE_TOUR_PATH } from './interactive-tour.const';
import { InteractiveTourDetail, InteractiveTourEdit, InteractiveTourOverview } from './views';

export const renderInteractiveTourRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_OVERVIEW}
		component={InteractiveTourOverview}
		exact
		path={INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_OVERVIEW}
	/>,
	<SecuredRoute
		key={INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_CREATE}
		component={InteractiveTourEdit}
		exact
		path={INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_CREATE}
	/>,
	<SecuredRoute
		key={INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_EDIT}
		component={InteractiveTourEdit}
		exact
		path={INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_EDIT}
	/>,
	<SecuredRoute
		key={INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_DETAIL}
		component={InteractiveTourDetail}
		exact
		path={INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_DETAIL}
	/>,
];

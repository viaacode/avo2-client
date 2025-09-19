import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components/SecuredRoute';

import { INTERACTIVE_TOUR_PATH } from './interactive-tour.const';
import { InteractiveTourDetail } from './views/InteractiveTourDetail';
import { InteractiveTourEdit } from './views/InteractiveTourEdit';
import { InteractiveTourOverview } from './views/InteractiveTourOverview';

export const renderInteractiveTourRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_OVERVIEW}
		Component={InteractiveTourOverview}
		exact
		path={INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_OVERVIEW}
	/>,
	<SecuredRoute
		key={INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_CREATE}
		Component={InteractiveTourEdit}
		exact
		path={INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_CREATE}
	/>,
	<SecuredRoute
		key={INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_EDIT}
		Component={InteractiveTourEdit}
		exact
		path={INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_EDIT}
	/>,
	<SecuredRoute
		key={INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_DETAIL}
		Component={InteractiveTourDetail}
		exact
		path={INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_DETAIL}
	/>,
];

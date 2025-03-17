import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { ASSIGNMENTS_PATH } from './assignments.const';
import AssignmentMarcomOverview from './views/AssignmentsMarcomOverview';
import AssignmentOverviewAdmin from './views/AssignmentsOverviewAdmin';

export const renderAdminAssignmentRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={ASSIGNMENTS_PATH.ASSIGNMENTS_OVERVIEW}
		component={AssignmentOverviewAdmin}
		exact
		path={ASSIGNMENTS_PATH.ASSIGNMENTS_OVERVIEW}
	/>,
	<SecuredRoute
		key={ASSIGNMENTS_PATH.ASSIGNMENTS_MARCOM_OVERVIEW}
		component={AssignmentMarcomOverview}
		exact
		path={ASSIGNMENTS_PATH.ASSIGNMENTS_MARCOM_OVERVIEW}
	/>,
];

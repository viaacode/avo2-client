import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { ASSIGNMENTS_PATH } from './assignments.const';
import AssignmentOverviewAdmin from './views/AssignmentsOverviewAdmin';

export const renderAdminAssignmentRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={ASSIGNMENTS_PATH.ASSIGNMENTS_OVERVIEW}
		component={AssignmentOverviewAdmin}
		exact
		path={ASSIGNMENTS_PATH.ASSIGNMENTS_OVERVIEW}
	/>,
];

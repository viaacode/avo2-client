import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { ASSIGNMENTS_PATH } from './assignments.const';
import AssignmentOverviewAdmin from './views/AssignmentsOverviewAdmin';
import PupilCollectionsOverview from './views/PupilCollectionsOverview';

export const renderAdminAssignmentRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={ASSIGNMENTS_PATH.ASSIGNMENTS_OVERVIEW}
		component={AssignmentOverviewAdmin}
		exact
		path={ASSIGNMENTS_PATH.ASSIGNMENTS_OVERVIEW}
	/>,
	<SecuredRoute
		key={ASSIGNMENTS_PATH.ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW}
		component={PupilCollectionsOverview}
		exact
		path={ASSIGNMENTS_PATH.ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW}
	/>,
];

import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';
import { ASSIGNMENT_PATH } from './assignments.const';
import { AssignmentLabels } from './views';

export const renderAdminAssignmentRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={ASSIGNMENT_PATH.ASSIGNMENT_LABELS}
		component={AssignmentLabels}
		exact
		path={ASSIGNMENT_PATH.ASSIGNMENT_LABELS}
	/>,
];

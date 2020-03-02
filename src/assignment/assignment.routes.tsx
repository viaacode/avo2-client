import React, { ReactNode } from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { APP_PATH } from '../constants';

import AssignmentCreate from './views/AssignmentCreate';
import AssignmentDetail from './views/AssignmentDetail';
import AssignmentEdit from './views/AssignmentEdit';

export const renderAssignmentRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={AssignmentCreate}
		exact={false}
		path={APP_PATH.ASSIGNMENT_CREATE.route}
		key={APP_PATH.ASSIGNMENT_CREATE.route}
	/>,
	<SecuredRoute
		component={AssignmentEdit}
		exact
		path={APP_PATH.ASSIGNMENT_EDIT.route}
		key={APP_PATH.ASSIGNMENT_EDIT.route}
	/>,
	<SecuredRoute
		component={AssignmentDetail}
		exact
		path={APP_PATH.ASSIGNMENT_DETAIL.route}
		key={APP_PATH.ASSIGNMENT_DETAIL.route}
	/>,
];

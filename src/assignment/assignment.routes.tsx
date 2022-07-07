import React, { ReactNode } from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { APP_PATH } from '../constants';

import AssignmentCreate from './views/AssignmentCreate';
import AssignmentDetail from './views/AssignmentDetail';
import AssignmentEdit from './views/AssignmentEdit';
import AssignmentResponseEdit from './views/AssignmentResponseEdit/AssignmentResponseEdit';
import AssignmentResponses from './views/AssignmentResponses';

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
		component={AssignmentResponses}
		exact
		path={APP_PATH.ASSIGNMENT_RESPONSES.route}
		key={APP_PATH.ASSIGNMENT_RESPONSES.route}
	/>,
	<SecuredRoute
		component={AssignmentResponseEdit}
		exact
		path={APP_PATH.ASSIGNMENT_RESPONSE_CREATE.route}
		key={APP_PATH.ASSIGNMENT_RESPONSE_CREATE.route}
	/>,
	<SecuredRoute
		component={AssignmentResponseEdit}
		exact
		path={APP_PATH.ASSIGNMENT_RESPONSE_EDIT.route}
		key={APP_PATH.ASSIGNMENT_RESPONSE_EDIT.route}
	/>,
	<SecuredRoute
		component={AssignmentDetail} // TODO change to component that shows readonly view of assignment response
		exact
		path={APP_PATH.ASSIGNMENT_RESPONSE_DETAIL.route}
		key={APP_PATH.ASSIGNMENT_RESPONSE_DETAIL.route}
	/>,
];

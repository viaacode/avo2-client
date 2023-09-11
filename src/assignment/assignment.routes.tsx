import React, { ReactNode } from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { APP_PATH } from '../constants';

import AssignmentCreate from './views/AssignmentCreate';
import AssignmentDetail from './views/AssignmentDetail';
import AssignmentEdit from './views/AssignmentEdit';
import AssignmentPupilCollectionDetail from './views/AssignmentPupilCollectionDetail';
import AssignmentResponseAdminEdit from './views/AssignmentResponseEdit/AssignmentResponseAdminEdit';
import AssignmentResponseEditPage from './views/AssignmentResponseEdit/AssignmentResponseEditPage';

export const renderAssignmentRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={AssignmentCreate}
		exact={false}
		path={APP_PATH.ASSIGNMENT_CREATE.route}
		key={APP_PATH.ASSIGNMENT_CREATE.route}
	/>,
	<SecuredRoute
		component={AssignmentDetail}
		exact
		path={APP_PATH.ASSIGNMENT_DETAIL.route}
		key={APP_PATH.ASSIGNMENT_DETAIL.route}
	/>,
	<SecuredRoute
		component={AssignmentEdit}
		exact
		path={APP_PATH.ASSIGNMENT_EDIT.route}
		key={APP_PATH.ASSIGNMENT_EDIT.route}
	/>,
	<SecuredRoute
		component={AssignmentEdit}
		exact
		path={APP_PATH.ASSIGNMENT_EDIT_TAB.route}
		key={APP_PATH.ASSIGNMENT_EDIT_TAB.route}
	/>,
	<SecuredRoute
		component={AssignmentResponseEditPage}
		exact
		path={APP_PATH.ASSIGNMENT_RESPONSE_CREATE.route}
		key={APP_PATH.ASSIGNMENT_RESPONSE_CREATE.route}
	/>,
	<SecuredRoute
		component={AssignmentResponseEditPage}
		exact
		path={APP_PATH.ASSIGNMENT_RESPONSE_EDIT.route}
		key={APP_PATH.ASSIGNMENT_RESPONSE_EDIT.route}
	/>,
	<SecuredRoute // view pupil collection response as teacher/admin
		component={AssignmentPupilCollectionDetail}
		exact
		path={APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_DETAIL.route}
		key={APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_DETAIL.route}
	/>,
	<SecuredRoute // edit pupil collection response as admin
		component={AssignmentResponseAdminEdit}
		exact
		path={APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_ADMIN_EDIT.route}
		key={APP_PATH.ASSIGNMENT_PUPIL_COLLECTION_ADMIN_EDIT.route}
	/>,
];

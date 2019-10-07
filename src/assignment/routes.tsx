import React from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { RouteParts } from '../constants';
import AssignmentDetail from './views/AssignmentDetail';
import AssignmentEdit from './views/AssignmentEdit';

export const renderAssignmentRoutes = () => (
	<>
		<SecuredRoute
			path={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/:id/${RouteParts.Edit}`}
			component={AssignmentEdit}
			exact
		/>
		<SecuredRoute
			path={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/${RouteParts.Create}`}
			component={AssignmentEdit}
			exact={false}
		/>
		<SecuredRoute path={`/${RouteParts.Assignment}/:id`} component={AssignmentDetail} exact />
	</>
);

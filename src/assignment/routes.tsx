import React, { ReactNode } from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { RouteParts } from '../constants';
import AssignmentDetail from './views/AssignmentDetail';
import AssignmentEdit from './views/AssignmentEdit';

export const renderAssignmentRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={AssignmentEdit}
		exact
		path={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/:id/${RouteParts.Edit}`}
		key={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/:id/${RouteParts.Edit}`}
	/>,
	<SecuredRoute
		component={AssignmentEdit}
		exact={false}
		path={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/${RouteParts.Create}`}
		key={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/${RouteParts.Create}`}
	/>,
	<SecuredRoute
		component={AssignmentDetail}
		exact
		path={`/${RouteParts.Assignment}/:id`}
		key={`/${RouteParts.Assignment}/:id`}
	/>,
];

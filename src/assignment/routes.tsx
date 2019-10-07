import React, { Fragment } from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { RouteParts } from '../constants';
import AssignmentDetail from './views/AssignmentDetail';
import EditAssignment from './views/EditAssignment';

export const renderAssignmentRoutes = () => (
	<Fragment>
		<SecuredRoute
			path={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/:id/${RouteParts.Edit}`}
			component={EditAssignment}
			exact
		/>
		<SecuredRoute
			path={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/${RouteParts.Create}`}
			component={EditAssignment}
			exact={false}
		/>
		<SecuredRoute path={`/${RouteParts.Assignment}/:id`} component={AssignmentDetail} exact />
	</Fragment>
);

import React, { Fragment } from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { RouteParts } from '../constants';
import Assignment from './views/Assignment';
import EditAssignment from './views/EditAssignment';

export const renderAssignmentRoutes = () => (
	<Fragment>
		<SecuredRoute
			path={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/:id/${RouteParts.Edit}`}
			component={EditAssignment}
			exact
		/>
		<SecuredRoute
			path={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/${RouteParts.Create}*`}
			component={EditAssignment}
			exact
		/>
		{/*<SecuredRoute*/}
		{/*	path={`/${RouteParts.MyWorkspace}/${RouteParts.Assignments}/:id`}*/}
		{/*	component={Assignment}*/}
		{/*	exact*/}
		{/*/>*/}
	</Fragment>
);

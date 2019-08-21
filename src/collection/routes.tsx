import React, { Fragment } from 'react';

import SecuredRoute from '../authentication/components/SecuredRoute';
import { RouteParts } from '../routes';
import Collection from './views/Collection';
import EditCollection from './views/EditCollection';

export const renderCollectionRoutes = () => (
	<Fragment>
		<SecuredRoute path={`/${RouteParts.Collection}/:id`} component={Collection} exact />
		<SecuredRoute
			path={`/${RouteParts.Collection}/:id/${RouteParts.Edit}`}
			component={EditCollection}
			exact
		/>
	</Fragment>
);

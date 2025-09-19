import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { PUPIL_COLLECTIONS_PATH } from './pupil-collection.const';
import { PupilCollectionsOverview } from './views/PupilCollectionsOverview';

export const renderAdminPupilCollectionRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={PUPIL_COLLECTIONS_PATH.ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW}
		Component={PupilCollectionsOverview}
		exact
		path={PUPIL_COLLECTIONS_PATH.ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW}
	/>,
];

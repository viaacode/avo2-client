import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import PupilCollectionsOverview from './/views/PupilCollectionsOverview';
import { PUPIL_COLLECTIONS_PATH } from './pupil-collection.const';

export const renderAdminPupilCollectionRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={PUPIL_COLLECTIONS_PATH.ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW}
		component={PupilCollectionsOverview}
		exact
		path={PUPIL_COLLECTIONS_PATH.ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW}
	/>,
];

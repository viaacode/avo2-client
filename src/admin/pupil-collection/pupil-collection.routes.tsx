import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import PupilCollectionsOverview from './/views/PupilCollectionsOverview';
import { PUPIL_COLLECTIONS_PATH } from './pupil-collection.const';

export const renderAdminPupilCollectionRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={PUPIL_COLLECTIONS_PATH.ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW}
		Component={PupilCollectionsOverview}
		exact
		path={PUPIL_COLLECTIONS_PATH.ASSIGNMENT_PUPIL_COLLECTIONS_OVERVIEW}
	/>,
];

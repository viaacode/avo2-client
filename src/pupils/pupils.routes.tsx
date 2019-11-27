import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';

import { PUPILS_PATH } from './pupils.const';
import { ForPupils } from './views';

export const renderPupilRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={ForPupils}
		exact
		path={PUPILS_PATH.FOR_PUPILS}
		key={PUPILS_PATH.FOR_PUPILS}
	/>,
];

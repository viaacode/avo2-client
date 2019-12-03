import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { PUPILS_PATH } from './pupils.const';
import { ForPupils } from './views';

export const renderPupilRoutes = (): ReactNode[] => [
	<Route component={ForPupils} exact path={PUPILS_PATH.FOR_PUPILS} key={PUPILS_PATH.FOR_PUPILS} />,
];

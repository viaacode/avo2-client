import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { KLAAR_PATH } from './klaar.const';
import KlaarJsonView from './views/KlaarJsonView';

export const renderKlaarRoutes = (): ReactNode[] => [
	<Route path={KLAAR_PATH.KLAAR_JSON} exact component={KlaarJsonView} key="klaar-json-view" />,
];

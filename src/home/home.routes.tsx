import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { SecuredRoute } from '../authentication/components';
import { HOME_PATH } from './home.const';
import { Home } from './views';

export const renderHomeRoutes = (): ReactNode[] =>
	window._ENV_.ENV === 'production'
		? [<SecuredRoute component={Home} exact path={HOME_PATH.HOME} key={HOME_PATH.HOME} />]
		: [<Route component={Home} exact path={HOME_PATH.HOME} key={HOME_PATH.HOME} />];

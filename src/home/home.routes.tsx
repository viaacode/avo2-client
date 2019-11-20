import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';

import { HOME_PATH } from './home.const';
import { Home } from './views';

export const renderHomeRoutes = (): ReactNode[] => [
	<SecuredRoute component={Home} exact path={HOME_PATH.HOME} key={HOME_PATH.HOME} />,
];

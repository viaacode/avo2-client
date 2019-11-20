import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { Home } from './views';

export const renderHomeRoutes = (): ReactNode[] => [
	<SecuredRoute component={Home} path="/" exact={true} key="/" />,
];

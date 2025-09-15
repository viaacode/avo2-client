import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { APP_PATH } from '../constants';

import { Item } from './views';

export const renderItemRoutes = (): ReactNode[] => [
	<SecuredRoute
		Component={Item}
		exact
		path={APP_PATH.ITEM_DETAIL.route}
		key={APP_PATH.ITEM_DETAIL.route}
	/>,
];

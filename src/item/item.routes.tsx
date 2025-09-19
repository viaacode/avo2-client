import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components/SecuredRoute';
import { APP_PATH } from '../constants';

import { ItemDetail } from './views/ItemDetail';

export const renderItemRoutes = (): ReactNode[] => [
	<SecuredRoute
		Component={ItemDetail}
		exact
		path={APP_PATH.ITEM_DETAIL.route}
		key={APP_PATH.ITEM_DETAIL.route}
	/>,
];

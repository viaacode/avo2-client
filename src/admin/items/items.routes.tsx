import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { ITEMS_PATH } from './items.const';
import { ItemsOverview } from './views';

export const renderItemRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={ITEMS_PATH.ITEMS_OVERVIEW}
		component={ItemsOverview}
		exact
		path={ITEMS_PATH.ITEMS_OVERVIEW}
	/>,
];

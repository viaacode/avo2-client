import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { APP_PATH } from '../constants';

import { Item } from './views';

export const renderItemRoutes = (): ReactNode[] => [
	<SecuredRoute component={Item} exact path={ITEM_PATH.ITEM_DETAIL.route} key={ITEM_PATH.ITEM_DETAIL.route} />,
];

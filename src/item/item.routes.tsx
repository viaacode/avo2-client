import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';

import { ITEM_PATH } from './item.const';
import { Item } from './views';

export const renderItemRoutes = (): ReactNode[] => [
	<SecuredRoute component={Item} exact path={ITEM_PATH.ITEM} key={ITEM_PATH.ITEM} />,
];

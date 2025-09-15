import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { ITEMS_PATH } from './items.const';
import { ItemDetail, ItemsOverview } from './views';
import PublishItemsOverview from './views/PublishItemsOverview';

export const renderItemRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={ITEMS_PATH.ITEMS_OVERVIEW}
		Component={ItemsOverview}
		exact
		path={ITEMS_PATH.ITEMS_OVERVIEW}
	/>,
	<SecuredRoute
		key={ITEMS_PATH.ITEM_DETAIL}
		Component={ItemDetail}
		exact
		path={ITEMS_PATH.ITEM_DETAIL}
	/>,
];

export const renderPublishItemRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={ITEMS_PATH.PUBLISH_ITEMS_OVERVIEW}
		Component={PublishItemsOverview}
		exact
		path={ITEMS_PATH.PUBLISH_ITEMS_OVERVIEW}
	/>,
];

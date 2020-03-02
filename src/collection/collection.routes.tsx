import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { APP_PATH } from '../constants';

import { CollectionDetail, CollectionEdit } from './views';

export const renderCollectionRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={CollectionDetail}
		exact
		path={APP_PATH.COLLECTION_DETAIL.route}
		key={APP_PATH.COLLECTION_DETAIL.route}
	/>,
	<SecuredRoute
		component={CollectionEdit}
		exact
		path={APP_PATH.COLLECTION_EDIT.route}
		key={APP_PATH.COLLECTION_EDIT.route}
	/>,
];

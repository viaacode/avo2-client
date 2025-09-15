import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { APP_PATH } from '../constants';

import { CollectionDetail, CollectionEdit } from './views';

export const renderCollectionRoutes = (): ReactNode[] => [
	<SecuredRoute
		Component={CollectionDetail}
		exact
		path={APP_PATH.COLLECTION_DETAIL.route}
		key={APP_PATH.COLLECTION_DETAIL.route}
	/>,
	<SecuredRoute
		Component={CollectionEdit}
		exact
		path={APP_PATH.COLLECTION_EDIT.route}
		key={APP_PATH.COLLECTION_EDIT.route}
	/>,
	<SecuredRoute
		Component={CollectionEdit}
		exact
		path={APP_PATH.COLLECTION_EDIT_TAB.route}
		key={APP_PATH.COLLECTION_EDIT_TAB.route}
	/>,
];

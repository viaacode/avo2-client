import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components/SecuredRoute';
import { APP_PATH } from '../constants';

import { CollectionDetail } from './views/CollectionDetail';
import { CollectionEdit } from './views/CollectionEdit';

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

import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';

import { COLLECTION_PATH } from './collection.const';
import { CollectionDetail, CollectionEdit } from './views';

export const renderCollectionRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={CollectionDetail}
		exact
		path={COLLECTION_PATH.COLLECTION_DETAIL}
		key={COLLECTION_PATH.COLLECTION_DETAIL}
	/>,
	<SecuredRoute
		component={CollectionEdit}
		exact
		path={COLLECTION_PATH.COLLECTION_EDIT}
		key={COLLECTION_PATH.COLLECTION_EDIT}
	/>,
];

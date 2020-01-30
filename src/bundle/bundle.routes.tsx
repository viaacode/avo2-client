import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';

import { BUNDLE_PATH } from './bundle.const';
import BundleDetail from './views/BundleDetail';

export const renderBundleRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={BundleDetail}
		exact
		path={BUNDLE_PATH.BUNDLE_DETAIL}
		key={BUNDLE_PATH.BUNDLE_DETAIL}
	/>,
];

// <SecuredRoute
// 	component={BundleEdit}
// 	exact
// 	path={COLLECTION_PATH.BUNDLES_EDIT}
// 	key={COLLECTION_PATH.BUNDLES_EDIT}
// />,

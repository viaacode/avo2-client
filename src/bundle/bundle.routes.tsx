import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';

import { BUNDLE_PATH } from './bundle.const';
import BundleDetail from './views/BundleDetail';
import BundleEdit from './views/BundleEdit';

export const renderBundleRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={BundleDetail}
		exact
		path={BUNDLE_PATH.BUNDLE_DETAIL}
		key={BUNDLE_PATH.BUNDLE_DETAIL}
	/>,
	<SecuredRoute
		component={BundleEdit}
		exact
		path={BUNDLE_PATH.BUNDLE_EDIT}
		key={BUNDLE_PATH.BUNDLE_EDIT}
	/>,
];

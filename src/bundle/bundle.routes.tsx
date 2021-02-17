import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { APP_PATH } from '../constants';

import BundleDetail from './views/BundleDetail';
import BundleEdit from './views/BundleEdit';

export const renderBundleRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={BundleDetail}
		exact
		path={APP_PATH.BUNDLE_DETAIL.route}
		key={APP_PATH.BUNDLE_DETAIL.route}
	/>,
	<SecuredRoute
		component={BundleEdit}
		exact
		path={APP_PATH.BUNDLE_EDIT.route}
		key={APP_PATH.BUNDLE_EDIT.route}
	/>,
	<SecuredRoute
		component={BundleEdit}
		exact
		path={APP_PATH.BUNDLE_EDIT_TAB.route}
		key={APP_PATH.BUNDLE_EDIT_TAB.route}
	/>,
];

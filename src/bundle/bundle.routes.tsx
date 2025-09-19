import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components/SecuredRoute';
import { APP_PATH } from '../constants';

import { BundleDetail } from './views/BundleDetail';
import { BundleEdit } from './views/BundleEdit';

export const renderBundleRoutes = (): ReactNode[] => [
	<SecuredRoute
		Component={BundleDetail}
		exact
		path={APP_PATH.BUNDLE_DETAIL.route}
		key={APP_PATH.BUNDLE_DETAIL.route}
	/>,
	<SecuredRoute
		Component={BundleEdit}
		exact
		path={APP_PATH.BUNDLE_EDIT.route}
		key={APP_PATH.BUNDLE_EDIT.route}
	/>,
	<SecuredRoute
		Component={BundleEdit}
		exact
		path={APP_PATH.BUNDLE_EDIT_TAB.route}
		key={APP_PATH.BUNDLE_EDIT_TAB.route}
	/>,
];

import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { APP_PATH } from '../constants';

import Profile from './components/Profile';
import { Settings } from './views';

export const renderSettingsRoutes = (): ReactNode[] => [
	<SecuredRoute
		Component={Settings}
		exact
		path={APP_PATH.SETTINGS.route}
		key={APP_PATH.SETTINGS.route}
	/>,
	<SecuredRoute
		Component={Settings}
		exact
		path={APP_PATH.SETTINGS_TAB.route}
		key={APP_PATH.SETTINGS_TAB.route}
	/>,
	<SecuredRoute
		Component={Profile}
		exact
		path={APP_PATH.COMPLETE_PROFILE.route}
		key={APP_PATH.COMPLETE_PROFILE.route}
	/>,
];

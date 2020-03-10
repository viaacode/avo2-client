import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { APP_PATH } from '../constants';

import { Profile } from './components';
import { Settings } from './views';

export const renderSettingsRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={Settings}
		exact
		path={APP_PATH.SETTINGS.route}
		key={APP_PATH.SETTINGS.route}
	/>,
	<SecuredRoute
		component={Settings}
		exact
		path={APP_PATH.SETTINGS_TAB.route}
		key={APP_PATH.SETTINGS_TAB.route}
	/>,
	<SecuredRoute
		component={Profile}
		exact
		path={APP_PATH.COMPLETE_PROFILE.route}
		key={APP_PATH.COMPLETE_PROFILE.route}
	/>,
];

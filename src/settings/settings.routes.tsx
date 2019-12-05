import React, { ReactNode } from 'react';
import { Route } from 'react-router';

import { Profile } from './components';
import { SETTINGS_PATH } from './settings.const';
import { Settings } from './views';

export const renderSettingsRoutes = (): ReactNode[] => [
	<Route component={Settings} exact path={SETTINGS_PATH.SETTINGS} key={SETTINGS_PATH.SETTINGS} />,
	<Route
		component={Settings}
		exact
		path={SETTINGS_PATH.SETTINGS_TAB}
		key={SETTINGS_PATH.SETTINGS_TAB}
	/>,
	<Route
		component={Profile}
		exact
		path={SETTINGS_PATH.COMPLETE_PROFILE}
		key={SETTINGS_PATH.COMPLETE_PROFILE}
	/>,
];

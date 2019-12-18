import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { Profile } from './components';
import { SETTINGS_PATH } from './settings.const';
import { Settings } from './views';

export const renderSettingsRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={Settings}
		exact
		path={SETTINGS_PATH.SETTINGS}
		key={SETTINGS_PATH.SETTINGS}
	/>,
	<SecuredRoute
		component={Settings}
		exact
		path={SETTINGS_PATH.SETTINGS_TAB}
		key={SETTINGS_PATH.SETTINGS_TAB}
	/>,
	<SecuredRoute
		component={Profile}
		exact
		profileHasToBeComplete={false}
		path={SETTINGS_PATH.COMPLETE_PROFILE}
		key={SETTINGS_PATH.COMPLETE_PROFILE}
	/>,
];

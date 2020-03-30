import React, { ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components';

import { TRANSLATIONS_PATH } from './translations.const';
import { TranslationsOverview } from './views';

export const renderAdminTranslationsRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={TRANSLATIONS_PATH.TRANSLATIONS}
		component={TranslationsOverview}
		exact
		path={TRANSLATIONS_PATH.TRANSLATIONS}
	/>,
];

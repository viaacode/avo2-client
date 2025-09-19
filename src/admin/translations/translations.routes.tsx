import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../../authentication/components/SecuredRoute';

import { TRANSLATIONS_PATH } from './translations.const';
import TranslationsOverviewPage from './views/TranslationsOverviewPage';

export const renderAdminTranslationsRoutes = (): ReactNode[] => [
	<SecuredRoute
		key={TRANSLATIONS_PATH.TRANSLATIONS}
		Component={TranslationsOverviewPage}
		exact
		path={TRANSLATIONS_PATH.TRANSLATIONS}
	/>,
];

import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { APP_PATH } from '../constants';

import { EmbedCodeDetail } from './views/EmbedCodeDetail';

export const renderEmbedRoutes = (): ReactNode[] => [
	<SecuredRoute
		Component={EmbedCodeDetail}
		exact
		path={APP_PATH.EMBED.route}
		key={APP_PATH.EMBED.route}
	/>,
];

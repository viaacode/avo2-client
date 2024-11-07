import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';

import Embed from './views/Embed';

export const renderEmbedRoutes = (): ReactNode[] => [
	<SecuredRoute path={'/embed/item/:pid'} exact component={Embed} key="embed-view" />,
];

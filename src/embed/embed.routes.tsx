import React, { type ReactNode } from 'react';
import { Route } from 'react-router';

import Embed from './views/EmbedChildPage';

export const renderEmbedRoutes = (): ReactNode[] => [
	<Route path={'/embed/item/:pid'} exact component={Embed} key="embed-view" />,
];

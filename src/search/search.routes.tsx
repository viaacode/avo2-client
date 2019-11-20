import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { SEARCH_PATH } from './search.const';
import { Search } from './views';

export const renderSearchRoutes = (): ReactNode[] => [
	<SecuredRoute component={Search} exact path={SEARCH_PATH.SEARCH} key={SEARCH_PATH.SEARCH} />,
];

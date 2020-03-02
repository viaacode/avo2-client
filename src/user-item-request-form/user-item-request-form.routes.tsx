import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { APP_PATH } from '../constants';

import UserItemRequestForm from './views/UserItemRequestForm';

export const renderUserItemRequestFormRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={UserItemRequestForm}
		exact
		path={APP_PATH.USER_ITEM_REQUEST_FORM.route}
		key={APP_PATH.USER_ITEM_REQUEST_FORM.route}
	/>,
];

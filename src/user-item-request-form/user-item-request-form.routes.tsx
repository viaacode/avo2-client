import React, { ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';

import { USER_ITEM_REQUEST_FORM_PATH } from './user-item-request-form.consts';
import UserItemRequestForm from './views/UserItemRequestForm';

export const renderUserItemRequestFormRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={UserItemRequestForm}
		exact
		path={USER_ITEM_REQUEST_FORM_PATH.USER_ITEM_REQUEST_FORM}
		key={USER_ITEM_REQUEST_FORM_PATH.USER_ITEM_REQUEST_FORM}
	/>,
];

import React, { type ReactNode } from 'react';

import { SecuredRoute } from '../authentication/components';
import { APP_PATH } from '../constants';

import EducationalAuthorItemRequestForm from './views/EducationalAuthorItemRequestForm';
import EducationalAuthorItemRequestFormConfirm from './views/EducationalAuthorItemRequestFormConfirm';
import UserItemRequestForm from './views/UserItemRequestForm';
import UserItemRequestFormConfirm from './views/UserItemRequestFormConfirm';

export const renderUserItemRequestFormRoutes = (): ReactNode[] => [
	<SecuredRoute
		component={UserItemRequestForm}
		exact
		path={APP_PATH.USER_ITEM_REQUEST_FORM.route}
		key={APP_PATH.USER_ITEM_REQUEST_FORM.route}
	/>,
	<SecuredRoute
		component={UserItemRequestFormConfirm}
		exact
		path={APP_PATH.USER_ITEM_REQUEST_FORM_CONFIRM.route}
		key={APP_PATH.USER_ITEM_REQUEST_FORM_CONFIRM.route}
	/>,
	<SecuredRoute
		component={EducationalAuthorItemRequestForm}
		exact
		path={APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM.route}
		key={APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM.route}
	/>,
	<SecuredRoute
		component={EducationalAuthorItemRequestFormConfirm}
		exact
		path={APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM_CONFIRM.route}
		key={APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM_CONFIRM.route}
	/>,
];

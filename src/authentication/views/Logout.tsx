import { FunctionComponent } from 'react';
import { RouteComponentProps } from 'react-router';

import { AUTH_PATH } from '../authentication.const';
import { redirectToLogoutPage } from '../helpers/redirect-to-idp';

export interface LogoutProps extends RouteComponentProps {}

export const Logout: FunctionComponent<LogoutProps> = () => {
	const base = window.location.href.split(AUTH_PATH.LOGOUT)[0];
	// Url to return to after logout is completed
	const returnToUrl = `${base}/`;
	redirectToLogoutPage(returnToUrl);
	return null;
};

export default Logout;

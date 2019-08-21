import { FunctionComponent } from 'react';

import { RouteComponentProps } from 'react-router';
import { RouteParts } from '../../routes';
import { redirectToLogoutPage } from '../helpers/redirect-to-idp';

export interface LogoutProps {}

export const Logout: FunctionComponent<LogoutProps & RouteComponentProps> = () => {
	const base = window.location.href.split(`/${RouteParts.Logout}`)[0];
	// Url to return to after logout is completed
	const returnToUrl = `${base}/`;
	redirectToLogoutPage(returnToUrl);
	return null;
};

export default Logout;

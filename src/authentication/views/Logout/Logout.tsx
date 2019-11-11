import { FunctionComponent } from 'react';

import { RouteComponentProps } from 'react-router';

import { RouteParts } from '../../../constants';

import { redirectToLogoutPage } from '../../helpers/redirect-to-idp';

export interface LogoutProps extends RouteComponentProps {}

export const Logout: FunctionComponent<LogoutProps> = () => {
	const base = window.location.href.split(`/${RouteParts.Logout}`)[0];
	// Url to return to after logout is completed
	const returnToUrl = `${base}/`;
	redirectToLogoutPage(returnToUrl);
	return null;
};

export default Logout;

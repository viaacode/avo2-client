import { FunctionComponent } from 'react';
import { RouteComponentProps } from 'react-router';

import { redirectToServerLogoutPage } from '../helpers/redirects';

export interface LogoutProps extends RouteComponentProps {}

export const Logout: FunctionComponent<LogoutProps> = ({ location }) => {
	redirectToServerLogoutPage(location);
	return null;
};

export default Logout;

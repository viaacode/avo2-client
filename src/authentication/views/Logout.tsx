import { get } from 'lodash-es';
import { FunctionComponent } from 'react';
import { RouteComponentProps } from 'react-router';

import withUser, { UserProps } from '../../shared/hocs/withUser';
import { redirectToServerLogoutPage } from '../helpers/redirects';

export interface LogoutProps extends RouteComponentProps, UserProps {}

export const Logout: FunctionComponent<LogoutProps> = ({ location, user }) => {
	redirectToServerLogoutPage(
		location,
		get(user, 'role.name') === 'leerling' ? '/leerlingen' : '/'
	);
	return null;
};

export default withUser(Logout) as FunctionComponent<RouteComponentProps>;

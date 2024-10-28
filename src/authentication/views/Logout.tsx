import { type FC } from 'react';
import { type RouteComponentProps } from 'react-router';

import { APP_PATH } from '../../constants';
import { ROUTE_PARTS } from '../../shared/constants';
import { isPupil } from '../../shared/helpers/is-pupil';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import { redirectToServerLogoutPage } from '../helpers/redirects';

export interface LogoutProps extends RouteComponentProps, UserProps {}

export const Logout: FC<LogoutProps> = ({ location, commonUser }) => {
	redirectToServerLogoutPage(
		location,
		isPupil(commonUser?.userGroup?.id) ? '/' + ROUTE_PARTS.pupils : APP_PATH.HOME.route
	);
	return null;
};

export default withUser(Logout) as FC<RouteComponentProps>;

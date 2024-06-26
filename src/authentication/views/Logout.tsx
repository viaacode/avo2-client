import { type FunctionComponent } from 'react';
import { type RouteComponentProps } from 'react-router';

import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';
import { APP_PATH } from '../../constants';
import { ROUTE_PARTS } from '../../shared/constants';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import { getUserGroupId } from '../helpers/get-profile-info';
import { redirectToServerLogoutPage } from '../helpers/redirects';

export interface LogoutProps extends RouteComponentProps, UserProps {}

export const Logout: FunctionComponent<LogoutProps> = ({ location, user }) => {
	const isPupil = [SpecialUserGroup.PupilSecondary, SpecialUserGroup.PupilElementary]
		.map(String)
		.includes(getUserGroupId(user?.profile));

	redirectToServerLogoutPage(location, isPupil ? '/' + ROUTE_PARTS.pupils : APP_PATH.HOME.route);
	return null;
};

export default withUser(Logout) as FunctionComponent<RouteComponentProps>;

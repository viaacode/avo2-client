import { type FC, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { APP_PATH } from '../../constants';
import { ROUTE_PARTS } from '../../shared/constants';
import { isPupil } from '../../shared/helpers/is-pupil';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import { redirectToServerLogoutPage } from '../helpers/redirects';

const Logout: FC<UserProps> = ({ commonUser }) => {
	const location = useLocation();

	useEffect(() => {
		redirectToServerLogoutPage(
			location,
			isPupil(commonUser?.userGroup?.id) ? '/' + ROUTE_PARTS.pupils : APP_PATH.HOME.route
		);
	}, []);

	return null;
};

export default withUser(Logout) as FC;

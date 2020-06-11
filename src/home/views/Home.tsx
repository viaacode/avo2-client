import React, { FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'redux';

import { UserService } from '../../admin/users/user.service';
import { APP_PATH } from '../../constants';
import { ContentPage } from '../../content-page/views';
import { ROUTE_PARTS } from '../../shared/constants';
import withUser, { UserProps } from '../../shared/hocs/withUser';

const Home: FunctionComponent<UserProps & RouteComponentProps> = ({ history, user }) => {
	// /start when user is a pupil => should be redirected to /werkruimte/opdrachten
	if (UserService.getUserRole(user) === 'leerling') {
		history.push(APP_PATH.WORKSPACE_ASSIGNMENTS.route);
		return null;
	}
	return <ContentPage path={`/${ROUTE_PARTS.loggedInHome}`} />;
};

export default compose(withRouter, withUser)(Home) as FunctionComponent;

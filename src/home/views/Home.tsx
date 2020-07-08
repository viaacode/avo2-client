import { get } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'redux';

import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';
import { getUserGroupId } from '../../authentication/helpers/get-profile-info';
import { APP_PATH } from '../../constants';
import { ContentPage } from '../../content-page/views';
import { ROUTE_PARTS } from '../../shared/constants';
import withUser, { UserProps } from '../../shared/hocs/withUser';

const Home: FunctionComponent<UserProps & RouteComponentProps> = ({ history, user }) => {
	// /start when user is a pupil => should be redirected to /werkruimte/opdrachten
	if (getUserGroupId(get(user, 'profile')) === SpecialUserGroup.Pupil) {
		history.push(APP_PATH.WORKSPACE_ASSIGNMENTS.route);
		return null;
	}
	return <ContentPage path={`/${ROUTE_PARTS.loggedInHome}`} />;
};

export default compose(withRouter, withUser)(Home) as FunctionComponent;

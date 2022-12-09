import { ContentPageRenderer } from '@meemoo/admin-core-ui';
import { get } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import MetaTags from 'react-meta-tags';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'redux';

import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';
import { getUserGroupId } from '../../authentication/helpers/get-profile-info';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ROUTE_PARTS } from '../../shared/constants';
import withUser, { UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';

const Home: FunctionComponent<UserProps & RouteComponentProps> = ({ history, user }) => {
	const { tText } = useTranslation();

	// /start when user is a pupil => should be redirected to /werkruimte/opdrachten
	if (getUserGroupId(get(user, 'profile')) === SpecialUserGroup.Pupil) {
		history.push(APP_PATH.WORKSPACE_ASSIGNMENTS.route);
		return null;
	}
	return (
		<>
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(tText('home/views/home___ingelogde-start-pagina-titel'))}
				</title>
				<meta
					name="description"
					content={tText('home/views/home___ingelogde-start-pagina-beschrijving')}
				/>
			</MetaTags>
			<ContentPageRenderer
				path={`/${ROUTE_PARTS.loggedInHome}`}
				onLoaded={() => scrollTo({ top: 0 })}
			/>
		</>
	);
};

export default compose(withRouter, withUser)(Home) as FunctionComponent;

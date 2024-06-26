import { ContentPageRenderer } from '@meemoo/admin-core-ui';
import React, { type FunctionComponent } from 'react';
import { Helmet } from 'react-helmet';
import { type RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'redux';

import { useGetContentPageByPath } from '../../admin/content-page/hooks/get-content-page-by-path';
import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ROUTE_PARTS } from '../../shared/constants';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';

const Home: FunctionComponent<UserProps & RouteComponentProps> = ({ history, commonUser }) => {
	const { tText } = useTranslation();
	const { data: contentPageInfo } = useGetContentPageByPath(`/${ROUTE_PARTS.loggedInHome}`);
	const isPupil = [SpecialUserGroup.PupilSecondary, SpecialUserGroup.PupilElementary]
		.map(String)
		.includes(String(commonUser?.userGroup?.id));

	// /start when user is a pupil => should be redirected to /werkruimte/opdrachten
	if (isPupil) {
		history.push(APP_PATH.WORKSPACE_ASSIGNMENTS.route);
		return null;
	}
	return (
		<>
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(tText('home/views/home___ingelogde-start-pagina-titel'))}
				</title>
				<meta
					name="description"
					content={tText('home/views/home___ingelogde-start-pagina-beschrijving')}
				/>
			</Helmet>
			{contentPageInfo && (
				<ContentPageRenderer
					contentPageInfo={contentPageInfo}
					onLoaded={() => scrollTo({ top: 0 })}
					commonUser={commonUser}
				/>
			)}
		</>
	);
};

export default compose(withRouter, withUser)(Home) as FunctionComponent;

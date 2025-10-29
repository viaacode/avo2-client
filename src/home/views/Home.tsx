import { ContentPageRenderer } from '@meemoo/admin-core-ui/client';
import React, { type FC } from 'react';
import { Helmet } from 'react-helmet';
import { type RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'redux';

import { useGetContentPageByPath } from '../../admin/content-page/hooks/get-content-page-by-path';
import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import InteractiveTour from '../../shared/components/InteractiveTour/InteractiveTour';
import { ROUTE_PARTS } from '../../shared/constants';
import { renderWrongUserRoleError } from '../../shared/helpers/render-wrong-user-role-error';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';

const Home: FC<UserProps & RouteComponentProps> = ({ history, commonUser }) => {
	const { tText } = useTranslation();
	const { data: contentPageInfo } = useGetContentPageByPath(`/${ROUTE_PARTS.loggedInHome}`);
	const isPupil = [SpecialUserGroupId.PupilSecondary, SpecialUserGroupId.PupilElementary]
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
				<>
					<InteractiveTour showButton={false} />
					<ContentPageRenderer
						contentPageInfo={contentPageInfo}
						commonUser={commonUser}
						renderNoAccessError={renderWrongUserRoleError}
					/>
				</>
			)}
		</>
	);
};

export default compose(withRouter, withUser)(Home) as FC;

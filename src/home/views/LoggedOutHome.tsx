import { ContentPageRenderer } from '@meemoo/admin-core-ui/client';
import { IconName } from '@viaa/avo2-components';
import { useAtomValue } from 'jotai';
import React, { type FC, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';

import { useGetContentPageByPath } from '../../admin/content-page/hooks/use-get-content-page-by-path.js';
import { commonUserAtom, loginAtom } from '../../authentication/authentication.store.js';
import { GENERATE_SITE_TITLE } from '../../constants.js';
import { ErrorView } from '../../error/views/ErrorView.js';
import { FullPageSpinner } from '../../shared/components/FullPageSpinner/FullPageSpinner.js';
import { InteractiveTour } from '../../shared/components/InteractiveTour/InteractiveTour.js';
import { renderWrongUserRoleError } from '../../shared/helpers/render-wrong-user-role-error.js';
import { tText } from '../../shared/helpers/translate-text.js';

export const LoggedOutHome: FC = () => {
	const location = useLocation();
	const navigateFunc = useNavigate();
	const loginState = useAtomValue(loginAtom);
	const commonUser = useAtomValue(commonUserAtom);

	const {
		data: contentPageInfo,
		error: contentPageError,
		isLoading: contentPageLoading,
	} = useGetContentPageByPath('/');

	useEffect(() => {
		if (location.pathname === '/' && !!commonUser) {
			// Redirect the logged out homepage to the logged in homepage is the user is logged in
			navigateFunc('/start', { replace: true });
			return;
		}
	}, [commonUser, location.pathname, navigateFunc]);

	if (loginState.loading || contentPageLoading) {
		return <FullPageSpinner />;
	}
	if (contentPageError) {
		return (
			<ErrorView
				message={tText(
					'home/views/logged-out-home___het-laden-van-deze-pagina-is-mislukt-pagina-kon-niet-worden-opgehaald-van-de-server'
				)}
				actionButtons={['home', 'helpdesk']}
				icon={IconName.alertTriangle}
			/>
		);
	}
	return (
		<>
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						tText('home/views/logged-out-home___uitgelogde-start-pagina-titel')
					)}
				</title>
				<meta
					name="description"
					content={tText(
						'home/views/logged-out-home___uitgelogde-start-pagina-beschrijving'
					)}
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

export default LoggedOutHome;

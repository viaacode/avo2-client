import { ContentPageRenderer } from '@meemoo/admin-core-ui/client';
import { Flex, Spinner } from '@viaa/avo2-components';
import { useAtomValue } from 'jotai';
import React, { type FC, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';

import { useGetContentPageByPath } from '../../admin/content-page/hooks/get-content-page-by-path';
import { commonUserAtom, loginAtom } from '../../authentication/authentication.store';
import { GENERATE_SITE_TITLE } from '../../constants';
import { InteractiveTour } from '../../shared/components/InteractiveTour/InteractiveTour';
import { renderWrongUserRoleError } from '../../shared/helpers/render-wrong-user-role-error';
import { useTranslation } from '../../shared/hooks/useTranslation';

export const LoggedOutHome: FC = () => {
	const { tText } = useTranslation();
	const location = useLocation();
	const navigateFunc = useNavigate();
	const loginState = useAtomValue(loginAtom);
	const commonUser = useAtomValue(commonUserAtom);

	const { data: contentPageInfo } = useGetContentPageByPath('/');

	useEffect(() => {
		if (location.pathname === '/' && !!commonUser) {
			// Redirect the logged out homepage to the logged in homepage is the user is logged in
			navigateFunc('/start', { replace: true });
			return;
		}
	}, [commonUser, location.pathname, navigateFunc]);

	if (loginState.loading) {
		return (
			<Flex orientation="horizontal" center>
				<Spinner size="large" />
			</Flex>
		);
	}
	return (
		<>
			<Helmet>
				<title>{GENERATE_SITE_TITLE(tText('Uitgelogde-start-pagina-titel'))}</title>
				<meta name="description" content={tText('Uitgelogde-start-pagina-beschrijving')} />
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

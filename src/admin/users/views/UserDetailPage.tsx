import { Flex, Spinner } from '@viaa/avo2-components';
import { useAtomValue } from 'jotai';
import React, { type FC, lazy, Suspense, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router';

import { commonUserAtom } from '../../../authentication/authentication.store';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import { ADMIN_PATH } from '../../admin.const';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { UserService } from '../user.service';

import './UserDetailPage.scss';

const UserDetail = lazy(() =>
	import('@meemoo/admin-core-ui/dist/admin.mjs').then((adminCoreModule) => ({
		default: adminCoreModule.UserDetail,
	}))
);

const UserDetailPage: FC = () => {
	const { tText } = useTranslation();
	const navigateFunc = useNavigate();
	const commonUser = useAtomValue(commonUserAtom);

	const [user, setUser] = useState<{ fullName?: string } | undefined>();
	const { id } = useParams<{ id: string }>();

	return (
		<>
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						user?.fullName,
						tText('admin/users/views/user-detail___item-detail-pagina-titel')
					)}
				</title>
				<meta
					name="description"
					content={tText(
						'admin/users/views/user-detail___gebruikersbeheer-detail-pagina-beschrijving'
					)}
				/>
			</Helmet>

			<Suspense
				fallback={
					<Flex orientation="horizontal" center>
						<Spinner size="large" />
					</Flex>
				}
			>
				{!!id && (
					<UserDetail
						id={id}
						onSetTempAccess={UserService.updateTempAccessByUserId}
						onLoaded={setUser}
						onGoBack={() =>
							goBrowserBackWithFallback(ADMIN_PATH.USER_OVERVIEW, navigateFunc)
						}
						commonUser={commonUser}
					/>
				)}
			</Suspense>
		</>
	);
};

export default withAdminCoreConfig(UserDetailPage) as FC;

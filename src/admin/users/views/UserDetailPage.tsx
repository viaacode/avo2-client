import { Flex, Spinner } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { type FC, lazy, Suspense, useState } from 'react';
import { Helmet } from 'react-helmet';
import { type RouteChildrenProps, useParams } from 'react-router';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { GENERATE_SITE_TITLE } from '../../../constants';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import withUser, { type UserProps } from '../../../shared/hocs/withUser';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ADMIN_PATH } from '../../admin.const';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { UserService } from '../user.service';

import './UserDetailPage.scss';

const UserDetail = lazy(() =>
	import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
		default: adminCoreModule.UserDetail,
	}))
);

const UserDetailPage: FC<UserProps & RouteChildrenProps> = ({ commonUser, history }) => {
	const { tText } = useTranslation();
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
				<UserDetail
					id={id}
					onSetTempAccess={UserService.updateTempAccessByUserId}
					onLoaded={setUser}
					onGoBack={() => goBrowserBackWithFallback(ADMIN_PATH.USER_OVERVIEW, history)}
					commonUser={commonUser as Avo.User.CommonUser}
				/>
			</Suspense>
		</>
	);
};

export default compose(withAdminCoreConfig, withUser, withRouter)(UserDetailPage) as FC;

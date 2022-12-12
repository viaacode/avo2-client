import { UserDetail } from '@meemoo/admin-core-ui';
import React, { FunctionComponent, useState } from 'react';
import MetaTags from 'react-meta-tags';

import { GENERATE_SITE_TITLE } from '../../../constants';
import useTranslation from '../../../shared/hooks/useTranslation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { UserService } from '../user.service';

const UserDetailPage: FunctionComponent = () => {
	const { tText } = useTranslation();
	const [user, setUser] = useState<{ fullName?: string } | undefined>();

	return (
		<>
			<MetaTags>
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
			</MetaTags>

			<UserDetail onSetTempAccess={UserService.updateTempAccessByUserId} onLoaded={setUser} />
		</>
	);
};

export default withAdminCoreConfig(UserDetailPage);

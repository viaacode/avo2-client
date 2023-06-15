import { UserDetail } from '@meemoo/admin-core-ui';
import type { Avo } from '@viaa/avo2-types';
import React, { FC, useState } from 'react';
import MetaTags from 'react-meta-tags';
import { useParams } from 'react-router';
import { compose } from 'redux';

import { GENERATE_SITE_TITLE } from '../../../constants';
import withUser, { UserProps } from '../../../shared/hocs/withUser';
import useTranslation from '../../../shared/hooks/useTranslation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { UserService } from '../user.service';

import './UserDetailPage.scss';

const UserDetailPage: FC<UserProps> = ({ commonUser }) => {
	const { tText } = useTranslation();
	const [user, setUser] = useState<{ fullName?: string } | undefined>();
	const { id } = useParams<{ id: string }>();

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

			<UserDetail
				id={id}
				onSetTempAccess={UserService.updateTempAccessByUserId}
				onLoaded={setUser}
				commonUser={commonUser as Avo.User.CommonUser}
			/>
		</>
	);
};

export default compose(withAdminCoreConfig, withUser)(UserDetailPage) as FC;

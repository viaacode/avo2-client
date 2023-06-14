import { UserOverview } from '@meemoo/admin-core-ui';
import type { Avo } from '@viaa/avo2-types';
import React, { FC } from 'react';
import MetaTags from 'react-meta-tags';
import { compose } from 'redux';

import { GENERATE_SITE_TITLE } from '../../../constants';
import withUser, { UserProps } from '../../../shared/hocs/withUser';
import useTranslation from '../../../shared/hooks/useTranslation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';

const UserOverviewPage: FC<UserProps> = ({ commonUser }) => {
	const { tText } = useTranslation();

	return (
		<AdminLayout
			pageTitle={tText('admin/users/views/user-overview___gebruikers')}
			size="full-width"
		>
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							tText(
								'admin/users/views/user-overview___gebruikersbeheer-overzicht-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={tText(
							'admin/users/views/user-overview___gebruikersbeheer-overzicht-pagina-beschrijving'
						)}
					/>
				</MetaTags>

				<UserOverview commonUser={commonUser as Avo.User.CommonUser} />
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default compose(withAdminCoreConfig, withUser)(UserOverviewPage) as FC;

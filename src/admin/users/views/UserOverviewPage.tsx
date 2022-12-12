import { UserOverview } from '@meemoo/admin-core-ui';
import React, { FunctionComponent } from 'react';
import MetaTags from 'react-meta-tags';

import { GENERATE_SITE_TITLE } from '../../../constants';
import useTranslation from '../../../shared/hooks/useTranslation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';

const UserOverviewPage: FunctionComponent = () => {
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

				<UserOverview />
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default withAdminCoreConfig(UserOverviewPage);

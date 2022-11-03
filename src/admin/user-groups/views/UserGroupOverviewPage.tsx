import { UserGroupOverview } from '@meemoo/admin-core-ui';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import { GENERATE_SITE_TITLE } from '../../../constants';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';

const UserGroupGroupOverviewPage: FunctionComponent = () => {
	const [t] = useTranslation();

	const renderPageContent = () => {
		return <UserGroupOverview />;
	};

	return (
		<AdminLayout pageTitle={t('Groepen en permissies')} size="full-width">
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							t(
								'admin/user-groups/views/user-group-overview___gebruikersgroepen-beheer-overzicht-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={t(
							'admin/user-groups/views/user-group-overview___gebruikersgroepen-beheer-overzicht-pagina-beschrijving'
						)}
					/>
				</MetaTags>
				{renderPageContent()}
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default withAdminCoreConfig(UserGroupGroupOverviewPage);

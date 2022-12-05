import React from 'react';
import MetaTags from 'react-meta-tags';

import { GENERATE_SITE_TITLE } from '../../../constants';
import useTranslation from '../../../shared/hooks/useTranslation';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';

const Dashboard = () => {
	const { tText, tHtml } = useTranslation();

	return (
		<AdminLayout pageTitle={tText('admin/dashboard/views/dashboard___dashboard')} size="large">
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							tText('admin/dashboard/views/dashboard___beheer-dashboard-pagina-titel')
						)}
					</title>
					<meta
						name="description"
						content={tText(
							'admin/dashboard/views/dashboard___beheer-dashboard-pagina-beschrijving'
						)}
					/>
				</MetaTags>
				<p>{tHtml('admin/dashboard/views/dashboard___introductie-beheer-dashboard')}</p>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default Dashboard;

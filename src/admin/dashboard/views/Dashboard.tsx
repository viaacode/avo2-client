import React from 'react';
import { Helmet } from 'react-helmet';

import { GENERATE_SITE_TITLE } from '../../../constants';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import { AdminLayoutBody } from '../../shared/layouts/AdminLayout/AdminLayout.slots';

export const Dashboard = () => {
	const { tText, tHtml } = useTranslation();

	return (
		<AdminLayout pageTitle={tText('admin/dashboard/views/dashboard___dashboard')} size="large">
			<AdminLayoutBody>
				<Helmet>
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
				</Helmet>
				<p>{tHtml('admin/dashboard/views/dashboard___introductie-beheer-dashboard')}</p>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default Dashboard;

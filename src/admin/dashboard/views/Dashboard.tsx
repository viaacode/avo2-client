import React from 'react';
import { Helmet } from 'react-helmet';
import { type ClientLoaderFunctionArgs, redirect } from 'react-router';

import { commonUserAtom } from '../../../authentication/authentication.store';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import { store } from '../../../shared/store/ui.store';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import { AdminLayoutBody } from '../../shared/layouts/AdminLayout/AdminLayout.slots';

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
	const commonUser = store.get(commonUserAtom);
	console.log('clientLoader called', { serverLoader, commonUser });
	if (!commonUser) {
		throw redirect(APP_PATH.LOGIN.route);
	}
	return await serverLoader();
}

clientLoader.hydrate = true as const;

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

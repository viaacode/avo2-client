import { Flex, Spinner } from '@viaa/avo2-components';
import React, { type FC, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';

import { GENERATE_SITE_TITLE } from '../../../constants';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

import './NavigationBarOverview.scss';

const NavigationOverview = lazy(() =>
	import('@meemoo/admin-core-ui/dist/admin.mjs').then((adminCoreModule) => ({
		default: adminCoreModule.NavigationBarOverview,
	}))
);

export const NavigationBarOverview: FC = () => {
	const { tText } = useTranslation();

	return (
		<div className="c-admin__navigation-overview">
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						tText('admin/menu/views/menu-overview___menu-overzicht-beheer-pagina-titel')
					)}
				</title>
				<meta
					name="description"
					content={tText(
						'admin/menu/views/menu-overview___menu-overzicht-beheer-pagina-beschrijving'
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
				<NavigationOverview />
			</Suspense>
		</div>
	);
};

export default withAdminCoreConfig(NavigationBarOverview) as FC;

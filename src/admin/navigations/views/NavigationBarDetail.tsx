import React, { type FunctionComponent, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import useTranslation from '../../../shared/hooks/useTranslation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

import './NavigationBarDetail.scss';
import { Flex, Spinner } from '@viaa/avo2-components';

const NavigationDetail = lazy(() =>
	import('@meemoo/admin-core-ui/dist/admin.mjs').then((adminCoreModule) => ({
		default: adminCoreModule.NavigationBarDetail,
	}))
);

type NavigationBarDetailProps = DefaultSecureRouteProps<{ navigationBarId: string }>;

const NavigationBarDetail: FunctionComponent<NavigationBarDetailProps> = ({ match }) => {
	const { tText } = useTranslation();

	const navigationBarId = match.params.navigationBarId;

	return (
		<div className="c-admin__navigation-detail">
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						navigationBarId,
						tText('admin/menu/views/menu-detail___menu-beheer-detail-pagina-titel')
					)}
				</title>
				<meta
					name="description"
					content={tText(
						'admin/menu/views/menu-detail___menu-beheer-detail-pagina-beschrijving'
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
				<NavigationDetail navigationBarId={navigationBarId} />
			</Suspense>
		</div>
	);
};

export default withAdminCoreConfig(NavigationBarDetail as FunctionComponent);

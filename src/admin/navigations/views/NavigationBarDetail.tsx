import { Flex, Spinner } from '@viaa/avo2-components';
import React, { type FC, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ADMIN_PATH } from '../../admin.const';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

import './NavigationBarDetail.scss';

const NavigationDetail = lazy(() =>
	import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
		default: adminCoreModule.NavigationBarDetail,
	}))
);

type NavigationBarDetailProps = DefaultSecureRouteProps<{ navigationBarId: string }>;

const NavigationBarDetail: FC<NavigationBarDetailProps> = ({ match, history }) => {
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
				<NavigationDetail
					navigationBarId={navigationBarId}
					onGoBack={() =>
						goBrowserBackWithFallback(ADMIN_PATH.NAVIGATIONS_OVERVIEW, history)
					}
				/>
			</Suspense>
		</div>
	);
};

export default compose(withAdminCoreConfig, withRouter)(NavigationBarDetail) as FC;

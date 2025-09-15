import { Flex, Spinner } from '@viaa/avo2-components';
import React, { type FC, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { useMatch, useNavigate } from 'react-router';
import { compose } from 'redux';

import { GENERATE_SITE_TITLE } from '../../../constants';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ADMIN_PATH } from '../../admin.const';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

import './NavigationBarDetail.scss';
import { NAVIGATIONS_PATH } from '../navigations.const';

const NavigationDetail = lazy(() =>
	import('@meemoo/admin-core-ui/dist/admin.mjs').then((adminCoreModule) => ({
		default: adminCoreModule.NavigationBarDetail,
	}))
);

const NavigationBarDetail: FC = () => {
	const { tText } = useTranslation();
	const navigateFunc = useNavigate();
	const match = useMatch<'navigationBarId', string>(NAVIGATIONS_PATH.NAVIGATIONS_DETAIL);

	const navigationBarId = match?.params.navigationBarId;

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
				{!!navigationBarId && (
					<NavigationDetail
						navigationBarId={navigationBarId}
						onGoBack={() =>
							goBrowserBackWithFallback(ADMIN_PATH.NAVIGATIONS_OVERVIEW, navigateFunc)
						}
					/>
				)}
			</Suspense>
		</div>
	);
};

export default compose(withAdminCoreConfig)(NavigationBarDetail) as FC;

import { Flex, Spinner } from '@viaa/avo2-components';
import React, { type FC, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { useMatch, useNavigate } from 'react-router';

import { GENERATE_SITE_TITLE } from '../../../constants';
import { buildLink } from '../../../shared/helpers/build-link';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import { ADMIN_PATH } from '../../admin.const';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

import './NavigationItemEdit.scss';
import { NAVIGATIONS_PATH } from '../navigations.const';

const NavigationEdit = lazy(() =>
	import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
		default: adminCoreModule.NavigationItemEdit,
	}))
);

const NavigationItemEdit: FC = () => {
	const { tText } = useTranslation();
	const navigateFunc = useNavigate();
	const match = useMatch<'navigationBarId' | 'navigationItemId', string>(
		NAVIGATIONS_PATH.NAVIGATIONS_ITEM_EDIT
	);

	const navigationBarId = match?.params.navigationBarId;
	const navigationItemId = match?.params.navigationItemId;

	// Render
	return (
		<div className="c-admin__navigation-edit">
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						tText(
							'admin/navigations/views/navigation-item-edit___navigation-item-edit-page-title'
						),
						navigationItemId
							? tText(
									'admin/menu/views/menu-edit___menu-item-beheer-bewerk-pagina-titel'
							  )
							: tText(
									'admin/menu/views/menu-edit___menu-item-beheer-aanmaak-pagina-titel'
							  )
					)}
				</title>
				<meta
					name="description"
					content={tText(
						'admin/navigations/views/navigation-item-edit___navigation-item-edit-page-description'
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
				<NavigationEdit
					navigationBarId={navigationBarId as string}
					navigationItemId={navigationItemId}
					onGoBack={() =>
						goBrowserBackWithFallback(
							buildLink(ADMIN_PATH.NAVIGATIONS_DETAIL, { navigationBarId }),
							navigateFunc
						)
					}
				/>
			</Suspense>
		</div>
	);
};

export default withAdminCoreConfig(NavigationItemEdit) as FC;

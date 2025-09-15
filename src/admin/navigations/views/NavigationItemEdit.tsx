import { Flex, Spinner } from '@viaa/avo2-components';
import React, { type FC, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { compose } from 'redux';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { buildLink } from '../../../shared/helpers/build-link';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ADMIN_PATH } from '../../admin.const';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { type MenuEditParams } from '../navigations.types';

import './NavigationItemEdit.scss';

const NavigationEdit = lazy(() =>
	import('@meemoo/admin-core-ui/dist/admin.mjs').then((adminCoreModule) => ({
		default: adminCoreModule.NavigationItemEdit,
	}))
);

type NavigationItemEditProps = DefaultSecureRouteProps<MenuEditParams>;

const NavigationItemEdit: FC<NavigationItemEditProps> = ({ history }) => {
	const { tText } = useTranslation();
	const { navigationBarId, navigationItemId } = match.params;

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
							history
						)
					}
				/>
			</Suspense>
		</div>
	);
};

export default compose(withAdminCoreConfig)(NavigationItemEdit) as FC;

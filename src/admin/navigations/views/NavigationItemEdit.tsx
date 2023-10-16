import { NavigationEdit } from '@meemoo/admin-core-ui';
import React, { FunctionComponent } from 'react';
import { Helmet } from 'react-helmet';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import useTranslation from '../../../shared/hooks/useTranslation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { MenuEditParams } from '../navigations.types';

import './NavigationItemEdit.scss';

type NavigationItemEditProps = DefaultSecureRouteProps<MenuEditParams>;

const NavigationItemEdit: FunctionComponent<NavigationItemEditProps> = ({ match }) => {
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
			<NavigationEdit
				navigationBarId={navigationBarId as string}
				navigationItemId={navigationItemId}
			/>
		</div>
	);
};

export default withAdminCoreConfig(NavigationItemEdit as FunctionComponent);

import { NavigationEdit } from '@meemoo/admin-core-ui';
import React, { FunctionComponent } from 'react';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import useTranslation from '../../../shared/hooks/useTranslation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { MenuEditParams } from '../navigations.types';

import './NavigationItemEdit.scss';

type NavigationItemEditProps = DefaultSecureRouteProps<MenuEditParams>;

const NavigationItemEdit: FunctionComponent<NavigationItemEditProps> = ({ match }) => {
	const { tText } = useTranslation();
	const { menu: menuParentId, id: menuItemId } = match.params;

	// Render
	return (
		<div className="c-admin__navigation-edit">
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						tText('navigation item edit page title'),
						menuItemId
							? tText(
									'admin/menu/views/menu-edit___menu-item-beheer-bewerk-pagina-titel'
							  )
							: tText(
									'admin/menu/views/menu-edit___menu-item-beheer-aanmaak-pagina-titel'
							  )
					)}
				</title>
				<meta name="description" content={tText('navigation item edit page description')} />
			</MetaTags>
			<NavigationEdit
				navigationBarId={menuParentId as string}
				navigationItemId={menuItemId}
			/>
		</div>
	);
};

export default withAdminCoreConfig(NavigationItemEdit as FunctionComponent);

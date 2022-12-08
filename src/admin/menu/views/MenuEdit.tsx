import { NavigationEdit } from '@meemoo/admin-core-ui';
import type { Avo } from '@viaa/avo2-types';
import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import useTranslation from '../../../shared/hooks/useTranslation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { INITIAL_MENU_FORM } from '../menu.const';
import { MenuEditParams } from '../menu.types';

import './MenuEdit.scss';

type MenuEditProps = DefaultSecureRouteProps<MenuEditParams>;

const MenuEdit: FunctionComponent<MenuEditProps> = ({ match }) => {
	const { tText } = useTranslation();
	const { menu: menuParentId, id: menuItemId } = match.params;

	// Hooks
	const [menuForm] = useState<Avo.Menu.Menu>(
		INITIAL_MENU_FORM(menuParentId ? String(menuParentId) : '0') as Avo.Menu.Menu
	);

	// Render
	return (
		<>
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						get(menuForm, 'label'),
						menuItemId
							? tText(
									'admin/menu/views/menu-edit___menu-item-beheer-bewerk-pagina-titel'
							  )
							: tText(
									'admin/menu/views/menu-edit___menu-item-beheer-aanmaak-pagina-titel'
							  )
					)}
				</title>
				<meta name="description" content={get(menuForm, 'description') || ''} />
			</MetaTags>
			<NavigationEdit
				navigationBarId={menuParentId as string}
				navigationItemId={menuItemId}
			/>
		</>
	);
};

export default withAdminCoreConfig(MenuEdit as FunctionComponent);

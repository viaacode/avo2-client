import { NavigationOverview } from '@meemoo/admin-core-ui';
import { Button } from '@viaa/avo2-components';
import React, { FunctionComponent } from 'react';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import useTranslation from '../../../shared/hooks/useTranslation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';
import { MENU_PATH } from '../menu.const';

type MenuOverviewProps = DefaultSecureRouteProps;

const MenuOverview: FunctionComponent<MenuOverviewProps> = ({ history }) => {
	const { tText } = useTranslation();

	return (
		<AdminLayout
			pageTitle={tText('admin/menu/views/menu-overview___navigatie-overzicht')}
			size="large"
		>
			<AdminLayoutTopBarRight>
				<Button
					label={tText('admin/menu/views/menu-overview___navigatie-toevoegen')}
					onClick={() => history.push(MENU_PATH.MENU_CREATE)}
				/>
			</AdminLayoutTopBarRight>
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							tText(
								'admin/menu/views/menu-overview___menu-overzicht-beheer-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={tText(
							'admin/menu/views/menu-overview___menu-overzicht-beheer-pagina-beschrijving'
						)}
					/>
				</MetaTags>
				<NavigationOverview />
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default withAdminCoreConfig(MenuOverview as FunctionComponent);

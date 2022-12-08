import { NavigationOverview } from '@meemoo/admin-core-ui';
import React, { FunctionComponent } from 'react';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import useTranslation from '../../../shared/hooks/useTranslation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

import './MenuOverview.scss';

type MenuOverviewProps = DefaultSecureRouteProps;

const MenuOverview: FunctionComponent<MenuOverviewProps> = () => {
	const { tText } = useTranslation();

	return (
		<>
			<MetaTags>
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
			</MetaTags>
			<NavigationOverview />
		</>
	);
};

export default withAdminCoreConfig(MenuOverview as FunctionComponent);
